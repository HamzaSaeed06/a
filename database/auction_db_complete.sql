-- ============================================================
-- CRICKET AUCTION MANAGEMENT SYSTEM
-- Production-aligned SQL schema for the current Next.js + Express app
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS Auction_DB;
CREATE DATABASE Auction_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Auction_DB;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. AUTH AND ACCESS
-- ============================================================

CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- ============================================================
-- 2. CORE MASTER DATA
-- ============================================================

CREATE TABLE Player_Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    min_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_price DECIMAL(12,2) NOT NULL DEFAULT 99999999,
    CHECK (min_price >= 0),
    CHECK (max_price >= min_price)
);

CREATE TABLE Countries (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(60) UNIQUE NOT NULL,
    region VARCHAR(50),
    country_code VARCHAR(20) NULL
);

CREATE TABLE Players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT CHECK (age BETWEEN 15 AND 55),
    role VARCHAR(50),
    base_price DECIMAL(12,2) NOT NULL CHECK (base_price >= 0),
    country_id INT NULL,
    status ENUM('unsold','sold','withdrawn','in-auction') DEFAULT 'unsold',
    category_id INT NULL,
    batting_style VARCHAR(30),
    bowling_style VARCHAR(50),
    image_url VARCHAR(500) NULL,
    video_url VARCHAR(500) NULL,
    added_by INT NULL,
    FOREIGN KEY (country_id) REFERENCES Countries(country_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES Player_Category(category_id) ON DELETE SET NULL,
    FOREIGN KEY (added_by) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE Teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(60),
    home_ground VARCHAR(100),
    total_budget DECIMAL(15,2) NOT NULL,
    remaining_budget DECIMAL(15,2) NOT NULL,
    owner_name VARCHAR(100),
    logo_url VARCHAR(500) NULL,
    user_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE Auction (
    auction_id INT AUTO_INCREMENT PRIMARY KEY,
    auction_name VARCHAR(140) NOT NULL,
    season YEAR UNIQUE NOT NULL,
    auction_date DATE NOT NULL,
    venue VARCHAR(100) NULL,
    location VARCHAR(100) NULL,
    total_budget_per_team DECIMAL(15,2) NULL,
    description TEXT NULL,
    total_players_auctioned INT DEFAULT 0,
    status ENUM('upcoming','live','completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Auction_Pool (
    pool_id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    player_id INT NOT NULL,
    lot_number INT,
    status ENUM('waiting','active','processed') DEFAULT 'waiting',
    current_bid DECIMAL(12,2) NULL,
    highest_bidder_id INT NULL,
    FOREIGN KEY (auction_id) REFERENCES Auction(auction_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (highest_bidder_id) REFERENCES Teams(team_id) ON DELETE SET NULL
);

CREATE TABLE Bids (
    bid_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    auction_id INT NOT NULL,
    bid_amount DECIMAL(12,2) NOT NULL CHECK (bid_amount > 0),
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES Auction(auction_id) ON DELETE CASCADE
);

CREATE TABLE Player_Sale (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT UNIQUE,
    team_id INT NOT NULL,
    auction_id INT NOT NULL,
    final_price DECIMAL(12,2) NOT NULL,
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES Auction(auction_id) ON DELETE CASCADE
);

CREATE TABLE Team_Squad (
    squad_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    season YEAR NOT NULL,
    jersey_no INT NULL,
    UNIQUE KEY uq_team_player_season (team_id, player_id, season),
    FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE
);

CREATE TABLE Player_Stats (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT UNIQUE,
    matches INT DEFAULT 0,
    runs_scored INT DEFAULT 0,
    wickets INT DEFAULT 0,
    centuries INT DEFAULT 0,
    fifties INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    best_bowling VARCHAR(20) DEFAULT 'N/A',
    avg_score DECIMAL(6,2) DEFAULT 0.00,
    strike_rate DECIMAL(6,2) DEFAULT 0.00,
    economy_rate DECIMAL(5,2) DEFAULT 0.00,
    catches INT DEFAULT 0,
    stumpings INT DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE
);

CREATE TABLE Auction_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100),
    player_id INT NULL,
    team_id INT NULL,
    auction_id INT NULL,
    amount DECIMAL(12,2) NULL,
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES Auction(auction_id) ON DELETE SET NULL
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_users_role ON Users(role_id);
CREATE INDEX idx_players_status ON Players(status);
CREATE INDEX idx_players_category ON Players(category_id);
CREATE INDEX idx_pool_auction ON Auction_Pool(auction_id);
CREATE INDEX idx_bids_player_auction ON Bids(player_id, auction_id);
CREATE INDEX idx_sales_team ON Player_Sale(team_id);
CREATE INDEX idx_logs_auction ON Auction_Log(auction_id);

-- ============================================================
-- 4. STORED PROCEDURES
-- ============================================================

DELIMITER $$

CREATE PROCEDURE Place_Bid(
    IN p_player INT,
    IN p_team INT,
    IN p_auction INT,
    IN p_amount DECIMAL(12,2)
)
BEGIN
    DECLARE max_bid DECIMAL(12,2);
    DECLARE base_p DECIMAL(12,2);
    DECLARE rem_budget DECIMAL(15,2);
    DECLARE already_sold INT;

    SELECT COUNT(*) INTO already_sold
    FROM Player_Sale
    WHERE player_id = p_player;

    IF already_sold > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Player already sold. Cannot bid.';
    END IF;

    SELECT base_price INTO base_p
    FROM Players
    WHERE player_id = p_player;

    SELECT COALESCE(MAX(bid_amount), 0) INTO max_bid
    FROM Bids
    WHERE player_id = p_player AND auction_id = p_auction;

    IF p_amount <= max_bid THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid must be higher than current highest bid.';
    END IF;

    IF p_amount < base_p THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid cannot be below base price.';
    END IF;

    SELECT remaining_budget INTO rem_budget
    FROM Teams
    WHERE team_id = p_team;

    IF rem_budget < p_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team does not have enough budget for this bid.';
    END IF;

    INSERT INTO Bids (player_id, team_id, auction_id, bid_amount)
    VALUES (p_player, p_team, p_auction, p_amount);

    INSERT INTO Auction_Log (action, player_id, team_id, auction_id, amount)
    VALUES ('BID_PLACED', p_player, p_team, p_auction, p_amount);
END$$

CREATE PROCEDURE Sell_Player(
    IN p_player INT,
    IN p_team INT,
    IN p_auction INT,
    IN p_price DECIMAL(12,2),
    IN p_season YEAR
)
BEGIN
    DECLARE rem_budget DECIMAL(15,2);
    DECLARE already_sold INT;

    SELECT COUNT(*) INTO already_sold
    FROM Player_Sale
    WHERE player_id = p_player;

    IF already_sold > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Player is already sold.';
    END IF;

    SELECT remaining_budget INTO rem_budget
    FROM Teams
    WHERE team_id = p_team;

    IF rem_budget < p_price THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team budget insufficient.';
    END IF;

    START TRANSACTION;
        UPDATE Players
        SET status = 'sold'
        WHERE player_id = p_player;

        INSERT INTO Player_Sale (player_id, team_id, auction_id, final_price)
        VALUES (p_player, p_team, p_auction, p_price);

        UPDATE Teams
        SET remaining_budget = remaining_budget - p_price
        WHERE team_id = p_team;

        INSERT IGNORE INTO Team_Squad (team_id, player_id, season)
        VALUES (p_team, p_player, p_season);

        INSERT INTO Auction_Log (action, player_id, team_id, auction_id, amount)
        VALUES ('MANUAL_SELL', p_player, p_team, p_auction, p_price);
    COMMIT;
END$$

DELIMITER ;

-- ============================================================
-- 5. SAFETY TRIGGERS
-- ============================================================

DELIMITER $$

CREATE TRIGGER prevent_negative_budget
BEFORE UPDATE ON Teams
FOR EACH ROW
BEGIN
    IF NEW.remaining_budget < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team budget cannot go below zero.';
    END IF;
END$$

CREATE TRIGGER prevent_duplicate_sale
BEFORE INSERT ON Player_Sale
FOR EACH ROW
BEGIN
    DECLARE sale_count INT;

    SELECT COUNT(*) INTO sale_count
    FROM Player_Sale
    WHERE player_id = NEW.player_id;

    IF sale_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Player has already been sold.';
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- 6. SEED ACCESS
-- Default password for both users: admin123
-- ============================================================

INSERT INTO Roles (role_name) VALUES
('Super Admin'),
('Admin'),
('Franchise');

INSERT INTO Users (username, email, password_hash, role_id) VALUES
('superadmin', 'superadmin@auction.com', '$2a$12$lBbwYVqxoRq51IHeAjUbReEzv4CR42wrcG5kHv9ahaG6BsIk3.yQC', 1),
('admin', 'admin@auction.com', '$2a$12$lBbwYVqxoRq51IHeAjUbReEzv4CR42wrcG5kHv9ahaG6BsIk3.yQC', 2);
