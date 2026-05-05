const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/franchise', require('./routes/franchise'));
app.use('/api/super-admin', require('./routes/superadmin'));

app.get('/', (req, res) => {
  res.json({ message: '🏏 PSL Auction API is running!' });
});

// Global Auction States
const { auctionTimers } = require('./state');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_auction', (auction_id) => {
    socket.join(`auction_${auction_id}`);
    console.log(`User joined auction: ${auction_id}`);
    
    // Send current state to newly joined user
    if (auctionTimers[auction_id]) {
      socket.emit('auction_sync', {
        timeLeft: auctionTimers[auction_id].timeLeft,
        isActive: auctionTimers[auction_id].isActive,
        currentPlayer: auctionTimers[auction_id].currentPlayer,
        highestBid: auctionTimers[auction_id].highestBid,
        highestBidder: auctionTimers[auction_id].highestBidder
      });
    }
  });

  socket.on('place_bid', async (data) => {
    try {
      const { auction_id, player_id, team_id, amount } = data;
      console.log(`Bid attempt: Auction ${auction_id}, Player ${player_id}, Team ${team_id}, Amount ${amount}`);
      const db = require('./db');
      
      // 1. Call DB procedure
      await db.query('CALL Place_Bid(?, ?, ?, ?)', [player_id, team_id, auction_id, amount]);
      
      // 2. Get Team Details
      const [teams] = await db.query('SELECT team_name, logo_url FROM Teams WHERE team_id = ?', [team_id]);
      const team_name = teams[0]?.team_name || 'Unknown Team';
      const team_logo = teams[0]?.logo_url || null;
      
      console.log(`Bid successful: ${team_name} bid ${amount}`);

      // 3. Update Server State
      if (auctionTimers[auction_id]) {
        auctionTimers[auction_id].timeLeft = 60; // Reset timer on bid
        auctionTimers[auction_id].highestBid = amount;
        auctionTimers[auction_id].highestBidder = { team_id, team_name, team_logo };
      }
      
      // 4. Broadcast
      const highestBidderObj = { team_id, team_name, team_logo };
      io.to(`auction_${auction_id}`).emit('bid_updated', {
        player_id,
        highestBid: amount,
        highestBidder: highestBidderObj,
        amount
      });
      io.to(`auction_${auction_id}`).emit('timer_update', {
        timeLeft: 60,
        isActive: true
      });
    } catch (err) {
      console.error("Bid error:", err.message);
      socket.emit('bid_error', { message: err.message });
    }
  });

  // Franchise bid broadcast
  socket.on('franchise_bid', async (data) => {
    const { auction_id, player_id, team_id, amount } = data;
    const db = require('./db');
    const [teams] = await db.query('SELECT team_name, logo_url FROM Teams WHERE team_id = ?', [team_id]);
    const team_name = teams[0]?.team_name || 'Unknown Team';
    const team_logo = teams[0]?.logo_url || null;
    const highestBidderObj = { team_id, team_name, team_logo };

    if (auctionTimers[auction_id]) {
      auctionTimers[auction_id].timeLeft = 60;
      auctionTimers[auction_id].highestBid = amount;
      auctionTimers[auction_id].highestBidder = highestBidderObj;
    }
    io.to(`auction_${auction_id}`).emit('bid_updated', { 
      player_id, 
      highestBid: amount, 
      highestBidder: highestBidderObj, 
      amount 
    });
    io.to(`auction_${auction_id}`).emit('timer_update', {
      timeLeft: 60,
      isActive: true
    });
  });

  // Admin Controls (Internal Socket Events)
  socket.on('admin_start_clock', (auction_id) => {
    if (!auctionTimers[auction_id]) {
      auctionTimers[auction_id] = {
        timeLeft: 60,
        isActive: true,
        currentPlayer: null,
        highestBid: 0,
        highestBidder: null
      };
    } else {
      auctionTimers[auction_id].isActive = true;
    }
    startTimer(auction_id);
    io.to(`auction_${auction_id}`).emit('auction_started');
    io.to(`auction_${auction_id}`).emit('timer_update', {
      timeLeft: auctionTimers[auction_id].timeLeft,
      isActive: true
    });
  });

  socket.on('admin_set_player', (data) => {
    const { auction_id, player } = data;
    auctionTimers[auction_id] = {
      timeLeft: 60,
      isActive: false,
      currentPlayer: player,
      highestBid: Number(player.base_price),
      highestBidder: null
    };
    io.to(`auction_${auction_id}`).emit('player_changed', player);
    io.to(`auction_${auction_id}`).emit('timer_update', {
      timeLeft: 60,
      isActive: false
    });
  });
});

function startTimer(auction_id) {
  if (auctionTimers[auction_id]?.interval) clearInterval(auctionTimers[auction_id].interval);
  
  auctionTimers[auction_id].interval = setInterval(() => {
    if (auctionTimers[auction_id].timeLeft > 0 && auctionTimers[auction_id].isActive) {
      auctionTimers[auction_id].timeLeft -= 1;
      io.to(`auction_${auction_id}`).emit('timer_update', {
        timeLeft: auctionTimers[auction_id].timeLeft,
        isActive: true
      });
    } else if (auctionTimers[auction_id].timeLeft === 0) {
      clearInterval(auctionTimers[auction_id].interval);
      auctionTimers[auction_id].isActive = false;
      
      const state = auctionTimers[auction_id];
      if (state.highestBidder && state.currentPlayer) {
        // Auto sell to highest bidder
        handleAutoSell(auction_id, state);
      } else {
        io.to(`auction_${auction_id}`).emit('auction_timeout');
      }
    }
  }, 1000);
}

async function handleAutoSell(auction_id, state) {
  const db = require('./db');
  try {
    // 1. Get current auction season
    const [auctions] = await db.query('SELECT season FROM Auction WHERE auction_id = ?', [auction_id]);
    const season = auctions[0]?.season || '2024';

    // 2. Call Sell_Player procedure
    await db.query('CALL Sell_Player(?, ?, ?, ?, ?)', [
      state.currentPlayer.player_id,
      state.highestBidder.team_id,
      auction_id,
      state.highestBid,
      season
    ]);

    // 3. Broadcast winner details
    io.to(`auction_${auction_id}`).emit('player_sold', {
      player: state.currentPlayer,
      team_id: state.highestBidder.team_id,
      team_name: state.highestBidder.team_name,
      amount: state.highestBid
    });

    console.log(`Auto-sold: ${state.currentPlayer.name} to ${state.highestBidder.team_name} for ${state.highestBid}`);
    
    // Clear state for this auction
    state.currentPlayer = null;
    state.highestBidder = null;
    state.highestBid = 0;

  } catch (err) {
    console.error("Auto-sell error:", err.message);
    io.to(`auction_${auction_id}`).emit('bid_error', { message: 'Auto-sell failed: ' + err.message });
  }
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
