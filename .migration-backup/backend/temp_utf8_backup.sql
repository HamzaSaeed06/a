-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: switchyard.proxy.rlwy.net    Database: Auction_DB
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Auction`
--

DROP TABLE IF EXISTS `Auction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Auction` (
  `auction_id` int NOT NULL AUTO_INCREMENT,
  `season` year NOT NULL,
  `auction_date` date NOT NULL,
  `venue` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_budget_per_team` decimal(15,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `total_players_auctioned` int DEFAULT '0',
  `status` enum('upcoming','active','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'upcoming',
  PRIMARY KEY (`auction_id`),
  UNIQUE KEY `season` (`season`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Auction`
--

LOCK TABLES `Auction` WRITE;
/*!40000 ALTER TABLE `Auction` DISABLE KEYS */;
/*!40000 ALTER TABLE `Auction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Auction_Log`
--

DROP TABLE IF EXISTS `Auction_Log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Auction_Log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `auction_id` int DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `log_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `auction_id` (`auction_id`),
  KEY `idx_log_action` (`action`),
  CONSTRAINT `Auction_Log_ibfk_1` FOREIGN KEY (`auction_id`) REFERENCES `Auction` (`auction_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Auction_Log`
--

LOCK TABLES `Auction_Log` WRITE;
/*!40000 ALTER TABLE `Auction_Log` DISABLE KEYS */;
/*!40000 ALTER TABLE `Auction_Log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Auction_Pool`
--

DROP TABLE IF EXISTS `Auction_Pool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Auction_Pool` (
  `pool_id` int NOT NULL AUTO_INCREMENT,
  `auction_id` int NOT NULL,
  `player_id` int NOT NULL,
  `lot_number` int DEFAULT NULL,
  `status` enum('waiting','active','processed') COLLATE utf8mb4_unicode_ci DEFAULT 'waiting',
  `current_bid` decimal(12,2) DEFAULT NULL,
  `highest_bidder_id` int DEFAULT NULL,
  PRIMARY KEY (`pool_id`),
  KEY `player_id` (`player_id`),
  KEY `highest_bidder_id` (`highest_bidder_id`),
  KEY `idx_pool_auction` (`auction_id`),
  CONSTRAINT `Auction_Pool_ibfk_1` FOREIGN KEY (`auction_id`) REFERENCES `Auction` (`auction_id`),
  CONSTRAINT `Auction_Pool_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `Players` (`player_id`),
  CONSTRAINT `Auction_Pool_ibfk_3` FOREIGN KEY (`highest_bidder_id`) REFERENCES `Teams` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Auction_Pool`
--

LOCK TABLES `Auction_Pool` WRITE;
/*!40000 ALTER TABLE `Auction_Pool` DISABLE KEYS */;
/*!40000 ALTER TABLE `Auction_Pool` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `Auction_Summary_View`
--

DROP TABLE IF EXISTS `Auction_Summary_View`;
/*!50001 DROP VIEW IF EXISTS `Auction_Summary_View`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `Auction_Summary_View` AS SELECT 
 1 AS `auction_id`,
 1 AS `season`,
 1 AS `status`,
 1 AS `total_sold`,
 1 AS `total_money_spent`,
 1 AS `highest_sale`,
 1 AS `avg_sale_price`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Bids`
--

DROP TABLE IF EXISTS `Bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Bids` (
  `bid_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `auction_id` int DEFAULT NULL,
  `bid_amount` decimal(12,2) NOT NULL,
  `bid_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bid_id`),
  KEY `idx_bid_player` (`player_id`),
  KEY `idx_bid_team` (`team_id`),
  KEY `idx_bid_auction` (`auction_id`),
  CONSTRAINT `Bids_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `Players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `Bids_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE,
  CONSTRAINT `Bids_ibfk_3` FOREIGN KEY (`auction_id`) REFERENCES `Auction` (`auction_id`) ON DELETE CASCADE,
  CONSTRAINT `Bids_chk_1` CHECK ((`bid_amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Bids`
--

LOCK TABLES `Bids` WRITE;
/*!40000 ALTER TABLE `Bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `Bids` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `prevent_low_bid` BEFORE INSERT ON `Bids` FOR EACH ROW BEGIN
    DECLARE bp DECIMAL(12,2);
    SELECT base_price INTO bp FROM Players WHERE player_id = NEW.player_id;
    IF NEW.bid_amount < bp THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bid amount is below the base price of the player.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `log_bid_placed` AFTER INSERT ON `Bids` FOR EACH ROW BEGIN
    INSERT INTO Auction_Log(action, player_id, team_id, auction_id, amount)
    VALUES ('BID_LOGGED', NEW.player_id, NEW.team_id, NEW.auction_id, NEW.bid_amount);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Coaches`
--

DROP TABLE IF EXISTS `Coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Coaches` (
  `coach_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  PRIMARY KEY (`coach_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `Coaches_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Coaches`
--

LOCK TABLES `Coaches` WRITE;
/*!40000 ALTER TABLE `Coaches` DISABLE KEYS */;
/*!40000 ALTER TABLE `Coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Countries`
--

DROP TABLE IF EXISTS `Countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Countries` (
  `country_id` int NOT NULL AUTO_INCREMENT,
  `country_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`country_id`),
  UNIQUE KEY `country_name` (`country_name`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Countries`
--

LOCK TABLES `Countries` WRITE;
/*!40000 ALTER TABLE `Countries` DISABLE KEYS */;
INSERT INTO `Countries` VALUES (1,'Pakistan','+92','PK'),(2,'Australia','+61','AU'),(5,'Iran','+98','IR'),(6,'Bangladesh','+880','BD'),(7,'Nepal','+977','NP'),(8,'West Indies','+1','UM'),(9,'Sri Lanka','+94','LK'),(10,'India','+91','IN'),(11,'Afghanistan','+93','AF'),(12,'China','+86','CN'),(13,'England','+44','GB-ENG'),(14,'South Africa','+27','ZA'),(15,'Bhutan','+975','BT'),(16,'Japan','+81','JP'),(17,'North Korea','+850','KP'),(18,'South Korea','+82','KR'),(22,'Kazakhstan','+7','KZ'),(23,'United Arab Emirates','+971','AE'),(24,'United Kingdom','+44','GB'),(25,'United States','+1','US'),(26,'Algeria','+213','DZ'),(27,'Argentina','+54','AR'),(28,'Zimbabwe','+263','ZW'),(29,'New Zealand','+64','NZ');
/*!40000 ALTER TABLE `Countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `Highest_Bids_View`
--

DROP TABLE IF EXISTS `Highest_Bids_View`;
/*!50001 DROP VIEW IF EXISTS `Highest_Bids_View`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `Highest_Bids_View` AS SELECT 
 1 AS `player_id`,
 1 AS `player_name`,
 1 AS `role`,
 1 AS `highest_bid`,
 1 AS `total_bids`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `Player_Bid_Ranking`
--

DROP TABLE IF EXISTS `Player_Bid_Ranking`;
/*!50001 DROP VIEW IF EXISTS `Player_Bid_Ranking`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `Player_Bid_Ranking` AS SELECT 
 1 AS `bid_rank`,
 1 AS `player_name`,
 1 AS `role`,
 1 AS `highest_bid`,
 1 AS `total_bids`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Player_Category`
--

DROP TABLE IF EXISTS `Player_Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player_Category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `max_price` decimal(12,2) NOT NULL DEFAULT '99999999.00',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  CONSTRAINT `Player_Category_chk_1` CHECK ((`min_price` >= 0)),
  CONSTRAINT `Player_Category_chk_2` CHECK ((`max_price` >= `min_price`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player_Category`
--

LOCK TABLES `Player_Category` WRITE;
/*!40000 ALTER TABLE `Player_Category` DISABLE KEYS */;
INSERT INTO `Player_Category` VALUES (1,'Platinum',50000000.00,999999999.00),(2,'Diamond',25000000.00,999999999.00),(3,'Gold',14000000.00,999999999.00),(4,'Silver',7000000.00,999999999.00),(5,'Emerging',3000000.00,999999999.00),(6,'Supplementary',1500000.00,999999999.00);
/*!40000 ALTER TABLE `Player_Category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Player_Sale`
--

DROP TABLE IF EXISTS `Player_Sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player_Sale` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `auction_id` int DEFAULT NULL,
  `final_price` decimal(12,2) NOT NULL,
  `sold_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sale_id`),
  UNIQUE KEY `player_id` (`player_id`),
  KEY `auction_id` (`auction_id`),
  KEY `idx_sale_team` (`team_id`),
  CONSTRAINT `Player_Sale_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `Players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `Player_Sale_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE,
  CONSTRAINT `Player_Sale_ibfk_3` FOREIGN KEY (`auction_id`) REFERENCES `Auction` (`auction_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player_Sale`
--

LOCK TABLES `Player_Sale` WRITE;
/*!40000 ALTER TABLE `Player_Sale` DISABLE KEYS */;
/*!40000 ALTER TABLE `Player_Sale` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `prevent_duplicate_sale` BEFORE INSERT ON `Player_Sale` FOR EACH ROW BEGIN
    DECLARE cnt INT;
    SELECT COUNT(*) INTO cnt FROM Player_Sale WHERE player_id = NEW.player_id;
    IF cnt > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Player has already been sold in this auction.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `auto_update_player_sold` AFTER INSERT ON `Player_Sale` FOR EACH ROW BEGIN
    UPDATE Players SET status = 'sold' WHERE player_id = NEW.player_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Player_Stats`
--

DROP TABLE IF EXISTS `Player_Stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player_Stats` (
  `stat_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int DEFAULT NULL,
  `matches` int DEFAULT '0',
  `runs_scored` int DEFAULT '0',
  `wickets` int DEFAULT '0',
  `centuries` int DEFAULT '0',
  `fifties` int DEFAULT '0',
  `highest_score` int DEFAULT '0',
  `best_bowling` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'N/A',
  `avg_score` decimal(6,2) DEFAULT '0.00',
  `strike_rate` decimal(6,2) DEFAULT '0.00',
  `economy_rate` decimal(5,2) DEFAULT '0.00',
  `catches` int DEFAULT '0',
  `stumpings` int DEFAULT '0',
  PRIMARY KEY (`stat_id`),
  UNIQUE KEY `player_id` (`player_id`),
  CONSTRAINT `Player_Stats_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `Players` (`player_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player_Stats`
--

LOCK TABLES `Player_Stats` WRITE;
/*!40000 ALTER TABLE `Player_Stats` DISABLE KEYS */;
INSERT INTO `Player_Stats` VALUES (2,3,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(6,4,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(7,5,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(8,6,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(9,7,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(10,8,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(12,10,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(13,11,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(14,12,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(15,13,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(16,14,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(17,15,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(18,16,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0),(19,17,0,0,0,0,0,0,'N/A',0.00,0.00,0.00,0,0);
/*!40000 ALTER TABLE `Player_Stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Players`
--

DROP TABLE IF EXISTS `Players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Players` (
  `player_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` int DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `country_id` int DEFAULT NULL,
  `status` enum('unsold','sold','withdrawn','in-auction') COLLATE utf8mb4_unicode_ci DEFAULT 'unsold',
  `category_id` int DEFAULT NULL,
  `batting_style` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bowling_style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `added_by` int DEFAULT NULL,
  PRIMARY KEY (`player_id`),
  KEY `country_id` (`country_id`),
  KEY `added_by` (`added_by`),
  KEY `idx_player_status` (`status`),
  KEY `idx_player_cat` (`category_id`),
  CONSTRAINT `Players_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `Player_Category` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `Players_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `Countries` (`country_id`) ON DELETE SET NULL,
  CONSTRAINT `Players_ibfk_3` FOREIGN KEY (`added_by`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `Players_chk_1` CHECK ((`age` between 15 and 55)),
  CONSTRAINT `Players_chk_2` CHECK ((`base_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Players`
--

LOCK TABLES `Players` WRITE;
/*!40000 ALTER TABLE `Players` DISABLE KEYS */;
INSERT INTO `Players` VALUES (3,'Babar Azam',30,'Batsman',500000.00,1,'unsold',1,'Right-hand bat','Right-arm medium','/uploads/image_1777787530165.jpg',NULL,NULL,1),(4,'Shaheen Shah Afridi',30,'Bowler',50000000.00,1,'unsold',1,'Right-hand bat','Right-arm fast','/uploads/image_1777834654623.jpg',NULL,NULL,1),(5,'Abdullah Shafique',30,'Batsman',500000.00,1,'unsold',2,'Right-hand bat','Right-arm off break','/uploads/image_1777834781568.jpg',NULL,NULL,1),(6,' Sikandar Raza',30,'All-rounder',14000000.00,28,'unsold',3,'Right-hand bat','Right-arm off break','/uploads/image_1777834916530.jpg',NULL,NULL,1),(7,'Mohammad Naeem',22,'Batsman',7000000.00,1,'unsold',4,'Left-hand bat','N/A','/uploads/image_1777835025305.jpg',NULL,NULL,1),(8,'Mustafizur Rahman',27,'Bowler',7000000.00,6,'unsold',4,'Left-hand bat','Left-arm fast-medium','/uploads/image_1777835805498.jpg',NULL,NULL,1),(10,'Fakhar Zaman',33,'Batsman',50000000.00,1,'unsold',1,'Left-hand bat','Right-arm off-break','/uploads/image_1777835942170.jpg',NULL,NULL,1),(11,'Haris Rauf',28,'Bowler',50000000.00,11,'unsold',1,'Right-hand bat','Right-arm fast','/uploads/image_1777836016435.jpg',NULL,NULL,1),(12,'Usama Mir',24,'Bowler',500000.00,1,'unsold',2,'Right-hand bat','Right-arm leg-break','/uploads/image_1777836109805.jpg',NULL,NULL,1),(13,'Ubaid Shah',22,'Bowler',3000000.00,1,'unsold',5,'Right-hand bat','Right-arm fast','/uploads/image_1777836210878.jpg',NULL,NULL,1),(14,' Haseebullah Khan',25,'Wicket-keeper Batsman',7000000.00,1,'unsold',4,'Right-hand bat','N/A','/uploads/image_1777836346666.jpg',NULL,NULL,1),(15,'Mohammad Farooq',27,'Batsman',3000000.00,1,'unsold',5,'Right-hand bat','Right-arm fast-medium','/uploads/image_1777836495395.jpg',NULL,NULL,1),(16,' Shadab Khan',33,'All-rounder',50000000.00,1,'unsold',1,'Right-hand bat','Right-arm leg-break','/uploads/image_1777836621397.jpg',NULL,NULL,1),(17,'Devon Conway',27,'Batsman',500000.00,29,'unsold',2,'Left-hand bat','N/A','/uploads/image_1777836918873.jpg',NULL,NULL,1);
/*!40000 ALTER TABLE `Players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (2,'Admin'),(3,'Franchise'),(1,'Super Admin');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `Sold_Players_View`
--

DROP TABLE IF EXISTS `Sold_Players_View`;
/*!50001 DROP VIEW IF EXISTS `Sold_Players_View`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `Sold_Players_View` AS SELECT 
 1 AS `player_id`,
 1 AS `player_name`,
 1 AS `category_name`,
 1 AS `role`,
 1 AS `country_name`,
 1 AS `team_name`,
 1 AS `final_price`,
 1 AS `season`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `Team_Spending_View`
--

DROP TABLE IF EXISTS `Team_Spending_View`;
/*!50001 DROP VIEW IF EXISTS `Team_Spending_View`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `Team_Spending_View` AS SELECT 
 1 AS `team_id`,
 1 AS `team_name`,
 1 AS `city`,
 1 AS `total_budget`,
 1 AS `total_spent`,
 1 AS `remaining_budget`,
 1 AS `players_bought`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Team_Squad`
--

DROP TABLE IF EXISTS `Team_Squad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Team_Squad` (
  `squad_id` int NOT NULL AUTO_INCREMENT,
  `team_id` int DEFAULT NULL,
  `player_id` int DEFAULT NULL,
  `season` year DEFAULT NULL,
  `jersey_no` int DEFAULT NULL,
  PRIMARY KEY (`squad_id`),
  UNIQUE KEY `team_id` (`team_id`,`player_id`,`season`),
  KEY `player_id` (`player_id`),
  KEY `idx_squad_season` (`season`),
  CONSTRAINT `Team_Squad_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`),
  CONSTRAINT `Team_Squad_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `Players` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team_Squad`
--

LOCK TABLES `Team_Squad` WRITE;
/*!40000 ALTER TABLE `Team_Squad` DISABLE KEYS */;
/*!40000 ALTER TABLE `Team_Squad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Teams`
--

DROP TABLE IF EXISTS `Teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Teams` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `home_ground` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_budget` decimal(15,2) NOT NULL,
  `remaining_budget` decimal(15,2) NOT NULL,
  `owner_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `owner_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `team_name` (`team_name`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Teams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Teams`
--

LOCK TABLES `Teams` WRITE;
/*!40000 ALTER TABLE `Teams` DISABLE KEYS */;
INSERT INTO `Teams` VALUES (1,'Karachi Kings','Karachi','National Stadium',95000000.00,95000000.00,'Salman Iqbal','/uploads/logo_1777814776389.png',4,NULL),(2,'Lahore Qalandars','Lahore','Gaddafi Stadium',105000000.00,105000000.00,'Sameen Rana & Atif Rana','/uploads/logo_1777813272046.png',5,NULL),(3,' Islamabad United',' Islamabad','Rawalpindi Cricket Stadium',100000000.00,100000000.00,'Ali Naqvi','/uploads/logo_1777813793257.png',6,NULL),(4,' Peshawar Zalmi',' Peshawar','Arbab Niaz Stadium',1000000000.00,1000000000.00,'Javed Afridi','/uploads/logo_1777813747712.png',7,NULL),(5,' Quetta Gladiators',' Quetta','Gaddafi Stadium',95000000.00,95000000.00,'Nadeem Omar ','/uploads/logo_1777814022118.png',8,NULL),(6,' Rawalpindi Pindiz ',' Rawalpindi','Rawalpindi Cricket Stadium',95000000.00,95000000.00,'Ahsan Tahir','/uploads/logo_1777814661076.png',9,NULL),(7,'Hyderabad Kingsmen','Hyderabad','Niaz Stadium',95000000.00,95000000.00,'Fawad Sarwar','/uploads/logo_1777814737947.png',10,NULL),(8,' Multan Sultans',' Multan','Multan Cricket Stadium',95000000.00,95000000.00,'Gohar Shah','/uploads/logo_1777816030691.png',11,NULL);
/*!40000 ALTER TABLE `Teams` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `prevent_negative_budget` BEFORE UPDATE ON `Teams` FOR EACH ROW BEGIN
    IF NEW.remaining_budget < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team budget cannot go below zero.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `Unsold_Players_View`
--

DROP TABLE IF EXISTS `Unsold_Players_View`;
/*!50001 DROP VIEW IF EXISTS `Unsold_Players_View`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `Unsold_Players_View` AS SELECT 
 1 AS `player_id`,
 1 AS `name`,
 1 AS `role`,
 1 AS `base_price`,
 1 AS `category_name`,
 1 AS `country_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'superadmin','superadmin@auction.com','\\.fzioXFqe3r2eDnWtqNoTsAVm9uxP8AW',1,1,'2026-05-03 12:18:37','2026-05-01 11:49:53'),(2,'admin','admin@auction.com','\\.fzioXFqe3r2eDnWtqNoTsAVm9uxP8AW',2,1,'2026-05-02 02:31:50','2026-05-01 11:49:53'),(3,'Lahore Qalanders','lahore@gmail.com','$2a$12$MCsK1Vz9MJbZJlC40zm69eY9GTPrsxUKZLsGTm2qTGmtqyvoHmky6',3,1,'2026-05-02 02:33:02','2026-05-01 13:17:47'),(4,'karachikings','karachikings@auction.com','$2a$12$11IewygT0rmF9h0eqdy6KOIo2vdUSwPNzokaEBBOAYrEYt6zLIeR6',3,1,'2026-05-03 18:37:09','2026-05-02 04:28:10'),(5,'lahoreqalandars','lahoreqalandars@auction.com','$2a$12$TH/dyyvS7OnfVxPpVFeCHODO5xfUG2bH.Yz3SzioUHrbtLhbvyUPu',3,1,'2026-05-03 19:37:55','2026-05-03 05:30:01'),(6,'islamabadunited','islamabadunited@auction.com','$2a$12$CkxWI3UxaDk8vwB/hMJiIeB6/LgyXl1zFORfhHYqfZyeSbGURltPS',3,1,'2026-05-03 19:37:23','2026-05-03 05:31:28'),(7,'peshawarzalmi','peshawarzalmi@auction.com','$2a$12$pOaxN5kpvtIeB4D90.al1OJ3TAJlSkEN1CsPZR6RQ/y.9e/IHJhJu',3,1,'2026-05-03 13:08:49','2026-05-03 05:32:58'),(8,'quettagladiators','quettagladiators@auction.com','$2a$12$JQURRC9m3szHSz3TYASgOuseSKje9F8jPadmUk8MZXxsao4mo1GN6',3,1,'2026-05-03 13:13:18','2026-05-03 05:34:22'),(9,'rawalpindipindiz','rawalpindipindiz@auction.com','$2a$12$L0F0po7VwtWV3pNT6qNO6eK81ahPBkGdGaumJUmuMEXyNl537K4zC',3,1,'2026-05-03 13:33:35','2026-05-03 05:36:21'),(10,'hyderabadkingsmen','hyderabadkingsmen@auction.com','$2a$12$d/MEFD4lKNDK4uHIuYSRLuO0B.XpWI.2MZWdiCggdZy7K1WOSrj0i',3,1,'2026-05-03 13:24:45','2026-05-03 05:37:48'),(11,'multansultans','multansultans@auction.com','$2a$12$vf211bbhaBNZEvxJSA8CpOpKDffcwRcLclflzWy4ZTYk27KcRqKki',3,1,'2026-05-03 18:21:08','2026-05-03 05:38:49');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Wishlist`
--

DROP TABLE IF EXISTS `Wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Wishlist` (
  `wishlist_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `team_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `max_bid` decimal(12,2) DEFAULT NULL,
  `priority` enum('primary','secondary','avoid') COLLATE utf8mb4_unicode_ci DEFAULT 'primary',
  PRIMARY KEY (`wishlist_id`),
  UNIQUE KEY `player_id` (`player_id`,`team_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `Wishlist_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `Players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `Wishlist_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Teams` (`team_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Wishlist`
--

LOCK TABLES `Wishlist` WRITE;
/*!40000 ALTER TABLE `Wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `Wishlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `Auction_Summary_View`
--

/*!50001 DROP VIEW IF EXISTS `Auction_Summary_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `Auction_Summary_View` AS select `a`.`auction_id` AS `auction_id`,`a`.`season` AS `season`,`a`.`status` AS `status`,count(`ps`.`sale_id`) AS `total_sold`,coalesce(sum(`ps`.`final_price`),0) AS `total_money_spent`,max(`ps`.`final_price`) AS `highest_sale`,avg(`ps`.`final_price`) AS `avg_sale_price` from (`Auction` `a` left join `Player_Sale` `ps` on((`a`.`auction_id` = `ps`.`auction_id`))) group by `a`.`auction_id`,`a`.`season`,`a`.`status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `Highest_Bids_View`
--

/*!50001 DROP VIEW IF EXISTS `Highest_Bids_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `Highest_Bids_View` AS select `p`.`player_id` AS `player_id`,`p`.`name` AS `player_name`,`p`.`role` AS `role`,max(`b`.`bid_amount`) AS `highest_bid`,count(`b`.`bid_id`) AS `total_bids` from (`Bids` `b` join `Players` `p` on((`b`.`player_id` = `p`.`player_id`))) group by `p`.`player_id`,`p`.`name`,`p`.`role` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `Player_Bid_Ranking`
--

/*!50001 DROP VIEW IF EXISTS `Player_Bid_Ranking`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `Player_Bid_Ranking` AS select rank() OVER (ORDER BY `ranked_data`.`highest_bid` desc )  AS `bid_rank`,`ranked_data`.`player_name` AS `player_name`,`ranked_data`.`role` AS `role`,`ranked_data`.`highest_bid` AS `highest_bid`,`ranked_data`.`total_bids` AS `total_bids` from (select `p`.`player_id` AS `player_id`,`p`.`name` AS `player_name`,`p`.`role` AS `role`,max(`b`.`bid_amount`) AS `highest_bid`,count(`b`.`bid_id`) AS `total_bids` from (`Bids` `b` join `Players` `p` on((`b`.`player_id` = `p`.`player_id`))) group by `p`.`player_id`,`p`.`name`,`p`.`role`) `ranked_data` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `Sold_Players_View`
--

/*!50001 DROP VIEW IF EXISTS `Sold_Players_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `Sold_Players_View` AS select `p`.`player_id` AS `player_id`,`p`.`name` AS `player_name`,`pc`.`category_name` AS `category_name`,`p`.`role` AS `role`,`c`.`country_name` AS `country_name`,`t`.`team_name` AS `team_name`,`ps`.`final_price` AS `final_price`,`a`.`season` AS `season` from (((((`Player_Sale` `ps` join `Players` `p` on((`ps`.`player_id` = `p`.`player_id`))) join `Teams` `t` on((`ps`.`team_id` = `t`.`team_id`))) join `Auction` `a` on((`ps`.`auction_id` = `a`.`auction_id`))) left join `Player_Category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `Countries` `c` on((`p`.`country_id` = `c`.`country_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `Team_Spending_View`
--

/*!50001 DROP VIEW IF EXISTS `Team_Spending_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `Team_Spending_View` AS select `t`.`team_id` AS `team_id`,`t`.`team_name` AS `team_name`,`t`.`city` AS `city`,`t`.`total_budget` AS `total_budget`,(`t`.`total_budget` - `t`.`remaining_budget`) AS `total_spent`,`t`.`remaining_budget` AS `remaining_budget`,count(`ps`.`sale_id`) AS `players_bought` from (`Teams` `t` left join `Player_Sale` `ps` on((`t`.`team_id` = `ps`.`team_id`))) group by `t`.`team_id`,`t`.`team_name`,`t`.`city`,`t`.`total_budget`,`t`.`remaining_budget` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `Unsold_Players_View`
--

/*!50001 DROP VIEW IF EXISTS `Unsold_Players_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `Unsold_Players_View` AS select `p`.`player_id` AS `player_id`,`p`.`name` AS `name`,`p`.`role` AS `role`,`p`.`base_price` AS `base_price`,`pc`.`category_name` AS `category_name`,`c`.`country_name` AS `country_name` from ((`Players` `p` left join `Player_Category` `pc` on((`p`.`category_id` = `pc`.`category_id`))) left join `Countries` `c` on((`p`.`country_id` = `c`.`country_id`))) where (`p`.`status` = 'unsold') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04  0:40:11
