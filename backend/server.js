const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
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
let auctionTimers = {}; // { auction_id: { timeLeft: 15, isActive: false, currentPlayer: null } }

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
      const db = require('./db');
      
      // 1. Call DB procedure
      await db.query('CALL Place_Bid(?, ?, ?, ?)', [player_id, team_id, auction_id, amount]);
      
      // 2. Get Team Name
      const [teams] = await db.query('SELECT team_name FROM Teams WHERE team_id = ?', [team_id]);
      const team_name = teams[0]?.team_name || 'Unknown Team';
      
      // 3. Update Server State
      if (auctionTimers[auction_id]) {
        auctionTimers[auction_id].timeLeft = 15; // Reset timer on bid
        auctionTimers[auction_id].highestBid = amount;
        auctionTimers[auction_id].highestBidder = { team_id, team_name };
      }
      
      // 4. Broadcast
      io.to(`auction_${auction_id}`).emit('bid_updated', {
        player_id,
        team_id,
        team_name,
        amount
      });
    } catch (err) {
      console.error("Bid error:", err.message);
      socket.emit('bid_error', { message: err.message });
    }
  });

  // Franchise bid broadcast (called after HTTP bid succeeds)
  socket.on('franchise_bid', (data) => {
    const { auction_id, player_id, team_id, team_name, amount } = data;
    // Reset timer on new bid
    if (auctionTimers[auction_id]) {
      auctionTimers[auction_id].timeLeft = 15;
      auctionTimers[auction_id].highestBid = amount;
      auctionTimers[auction_id].highestBidder = { team_id, team_name };
    }
    // Broadcast to everyone in the room
    io.to(`auction_${auction_id}`).emit('bid_updated', { player_id, team_id, team_name, amount, bid_amount: amount });
    io.to(`auction_${auction_id}`).emit('timer_update', 15);
  });

  // Admin Controls (Internal Socket Events)
  socket.on('admin_start_clock', (auction_id) => {
    if (!auctionTimers[auction_id]) return;
    auctionTimers[auction_id].isActive = true;
    startTimer(auction_id);
    io.to(`auction_${auction_id}`).emit('auction_started');
  });

  socket.on('admin_set_player', (data) => {
    const { auction_id, player } = data;
    auctionTimers[auction_id] = {
      timeLeft: 15,
      isActive: false,
      currentPlayer: player,
      highestBid: Number(player.base_price),
      highestBidder: null
    };
    io.to(`auction_${auction_id}`).emit('player_changed', player);
  });
});

function startTimer(auction_id) {
  if (auctionTimers[auction_id]?.interval) clearInterval(auctionTimers[auction_id].interval);
  
  auctionTimers[auction_id].interval = setInterval(() => {
    if (auctionTimers[auction_id].timeLeft > 0 && auctionTimers[auction_id].isActive) {
      auctionTimers[auction_id].timeLeft -= 1;
      io.to(`auction_${auction_id}`).emit('timer_update', auctionTimers[auction_id].timeLeft);
    } else if (auctionTimers[auction_id].timeLeft === 0) {
      clearInterval(auctionTimers[auction_id].interval);
      auctionTimers[auction_id].isActive = false;
      io.to(`auction_${auction_id}`).emit('auction_timeout');
    }
  }, 1000);
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
