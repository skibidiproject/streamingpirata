-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Giu 05, 2025 alle 12:02
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `streaming`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `admin`
--

CREATE TABLE `admin` (
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `admin`
--

INSERT INTO `admin` (`Username`, `Password`) VALUES
('123', '123');

-- --------------------------------------------------------

--
-- Struttura della tabella `content`
--

CREATE TABLE `content` (
  `Imdb_ID` varchar(16) NOT NULL,
  `Name` varchar(50) NOT NULL,
  `Description` text NOT NULL,
  `Cover_url` varchar(255) NOT NULL,
  `Hero_url` varchar(255) DEFAULT NULL,
  `Release_year` int(11) NOT NULL,
  `Pegi_rating` int(11) NOT NULL,
  `Content_type` enum('film','serie') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `content`
--

INSERT INTO `content` (`Imdb_ID`, `Name`, `Description`, `Cover_url`, `Hero_url`, `Release_year`, `Pegi_rating`, `Content_type`) VALUES
('1', 'Interstellar', 'Interstellar è un film', 'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2021/08/19085635/gEU2QniE6E77NI6lCU6MxlNBvIx-scaled.jpg', 'https://www.blogo.it/app/uploads/sites/3/2023/07/interstellar-torna-al-cinema-lodissea-sci-fi-di-cristopher-nolan-nelle-sale-dal-31-luglio-al-2-agosto-2.jpg', 2014, 13, 'film'),
('2', 'Cinaglia', 'Negro negro', 'oiahsd', 'asdkjg', 2007, 18, 'film'),
('3', 'Crementi', 'Ciao nigger', 'ASDAaas', 'adasd', 2010230123, 99, 'film'),
('4', 'Jojo\'s bizzarre adventure', 'Niggas', 'https://next-media.elkjop.com/image/dv_web_D1800010021386774/597312/jojos-bizarre-adventure-all-star-battle-r-pc-windows.jpg?w=1200&q=75', 'https://i.ytimg.com/vi/q5YTt8Jtnxw/maxresdefault.jpg', 2010, 13, 'serie');

-- --------------------------------------------------------

--
-- Struttura della tabella `metadata`
--

CREATE TABLE `metadata` (
  `Imdb_ID` varchar(16) NOT NULL,
  `Metadata_type` varchar(255) DEFAULT NULL,
  `Value` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `movies`
--

CREATE TABLE `movies` (
  `Imdb_ID` varchar(16) NOT NULL,
  `Stream_url1` varchar(255) DEFAULT NULL,
  `Stream_url2` varchar(255) DEFAULT NULL,
  `Stream_url3` varchar(255) DEFAULT NULL,
  `Movie_length` int(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `serie`
--

CREATE TABLE `serie` (
  `Imdb_ID` varchar(16) NOT NULL,
  `Stream_url1` varchar(255) DEFAULT NULL,
  `Stream_url2` varchar(255) DEFAULT NULL,
  `Stream_url3` varchar(255) DEFAULT NULL,
  `Seasons` int(16) DEFAULT NULL,
  `Airing` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`Imdb_ID`);

--
-- Indici per le tabelle `metadata`
--
ALTER TABLE `metadata`
  ADD PRIMARY KEY (`Imdb_ID`);

--
-- Indici per le tabelle `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`Imdb_ID`);

--
-- Indici per le tabelle `serie`
--
ALTER TABLE `serie`
  ADD PRIMARY KEY (`Imdb_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
