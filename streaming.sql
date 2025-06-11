-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Giu 11, 2025 alle 20:40
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
  `id` int(11) NOT NULL,
  `master` tinyint(1) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `admin`
--

INSERT INTO `admin` (`id`, `master`, `username`, `password`) VALUES
(2, 0, 'utenza0', '$2b$10$6h.CyhVDM7y/ymzTh6u61O/wuEDuGXBk4EJ/HO3pDbNSKM2oOy8iu');

-- --------------------------------------------------------

--
-- Struttura della tabella `content`
--

CREATE TABLE `content` (
  `Imdb_ID` varchar(16) NOT NULL,
  `Added_date` datetime NOT NULL DEFAULT current_timestamp(),
  `Name` varchar(50) NOT NULL,
  `Description` text NOT NULL,
  `Cover_url` varchar(255) NOT NULL,
  `Hero_url` varchar(255) DEFAULT NULL,
  `Release_year` int(11) NOT NULL,
  `Pegi_rating` varchar(4) NOT NULL,
  `Content_type` enum('film','serie') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `content`
--

INSERT INTO `content` (`Imdb_ID`, `Added_date`, `Name`, `Description`, `Cover_url`, `Hero_url`, `Release_year`, `Pegi_rating`, `Content_type`) VALUES
('1', '2025-06-12 13:32:14', 'Interstellar', 'In seguito alla scoperta di un cunicolo spazio-temporale, un gruppo di esploratori si avventura in una eroica missione per tentare di superare i limiti della conquista spaziale e oltrepassare le distanze che fino a quel momento avevano reso impraticabili i viaggi interstellari. L\'obiettivo è quello di trovare nuovi luoghi dove coltivare il granoturco, l\'unica coltivazione rimasta dopo un drastico cambiamento climatico che ha colpito soprattutto l\'agricoltura.', 'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2021/08/19085635/gEU2QniE6E77NI6lCU6MxlNBvIx-scaled.jpg', 'https://www.blogo.it/app/uploads/sites/3/2023/07/interstellar-torna-al-cinema-lodissea-sci-fi-di-cristopher-nolan-nelle-sale-dal-31-luglio-al-2-agosto-2.jpg', 2014, 'VM18', 'film'),
('10', '2025-06-10 13:32:14', 'oppenheimer', 'Federico distone', 'https://m.media-amazon.com/images/M/MV5BNTFlZDI1YWQtMTVjNy00YWU1LTg2YjktMTlhYmRiYzQ3NTVhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://i.ytimg.com/vi/AByfwXr_JXs/maxresdefault.jpg', 2024, '13', 'film'),
('12', '2025-06-10 13:32:14', 'zodiac', 'Film 123', 'https://m.media-amazon.com/images/I/61E0FgTRRmL.jpg', 'https://hotcorn-cdn.fra1.cdn.digitaloceanspaces.com/wp-content/uploads/sites/2/2020/04/21171648/zodiac.jpg', 2010, '13', 'film'),
('14', '2025-06-12 13:32:14', 'Interstellar 2', 'In seguito alla scoperta di un cunicolo spazio-temporale, un gruppo di esploratori si avventura in una eroica missione per tentare di superare i limiti della conquista spaziale e oltrepassare le distanze che fino a quel momento avevano reso impraticabili i viaggi interstellari. L\'obiettivo è quello di trovare nuovi luoghi dove coltivare il granoturco, l\'unica coltivazione rimasta dopo un drastico cambiamento climatico che ha colpito soprattutto l\'agricoltura.', 'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2021/08/19085635/gEU2QniE6E77NI6lCU6MxlNBvIx-scaled.jpg', 'https://www.blogo.it/app/uploads/sites/3/2023/07/interstellar-torna-al-cinema-lodissea-sci-fi-di-cristopher-nolan-nelle-sale-dal-31-luglio-al-2-agosto-2.jpg', 2014, 'VM18', 'film'),
('2', '2025-06-10 13:32:14', 'Cinaglia', 'Negro negro', 'oiahsd', 'asdkjg', 2007, '18', 'film'),
('3', '2025-06-10 13:32:14', 'Crementi', 'Ciao nigger', 'ASDAaas', 'adasd', 2010230123, '99', 'film'),
('4', '2025-06-10 13:32:14', 'Jojo\'s bizzarre adventure', 'Niggas', 'https://next-media.elkjop.com/image/dv_web_D1800010021386774/597312/jojos-bizarre-adventure-all-star-battle-r-pc-windows.jpg?w=1200&q=75', 'https://i.ytimg.com/vi/q5YTt8Jtnxw/maxresdefault.jpg', 2010, '13', 'serie'),
('5', '2025-06-10 13:32:14', 'oppenheimer', 'Federico distone', 'https://m.media-amazon.com/images/M/MV5BNTFlZDI1YWQtMTVjNy00YWU1LTg2YjktMTlhYmRiYzQ3NTVhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://i.ytimg.com/vi/AByfwXr_JXs/maxresdefault.jpg', 2024, '13', 'film'),
('6', '2025-06-10 13:32:14', 'zodiac', 'Film 123', 'https://m.media-amazon.com/images/I/61E0FgTRRmL.jpg', 'https://hotcorn-cdn.fra1.cdn.digitaloceanspaces.com/wp-content/uploads/sites/2/2020/04/21171648/zodiac.jpg', 2010, '13', 'film'),
('8', '2025-06-10 13:32:15', 'Avengers EndGame', 'ciao', 'https://i.redd.it/a1h3w7blmm2a1.jpg', 'https://quinlan.it/upload/images/2019/04/Avengers-Endgame-2019-Anthony-Russo-Joe-Russo-23.jpg', 2012, '12', 'film');

-- --------------------------------------------------------

--
-- Struttura della tabella `episodes`
--

CREATE TABLE `episodes` (
  `Imdb_ID_season` varchar(16) NOT NULL,
  `Stream_url1` varchar(255) DEFAULT NULL,
  `Stream_url2` varchar(255) DEFAULT NULL,
  `Stream_url3` varchar(255) DEFAULT NULL,
  `Airing` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Struttura della tabella `seasons`
--

CREATE TABLE `seasons` (
  `Imdb_ID` varchar(16) NOT NULL,
  `Imdb_ID_season` varchar(16) NOT NULL,
  `episodes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`Imdb_ID`);

--
-- Indici per le tabelle `episodes`
--
ALTER TABLE `episodes`
  ADD PRIMARY KEY (`Imdb_ID_season`);

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
-- Indici per le tabelle `seasons`
--
ALTER TABLE `seasons`
  ADD PRIMARY KEY (`Imdb_ID`,`Imdb_ID_season`),
  ADD KEY `Imdb_ID_season` (`Imdb_ID_season`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `metadata`
--
ALTER TABLE `metadata`
  ADD CONSTRAINT `metadata_ibfk_1` FOREIGN KEY (`Imdb_ID`) REFERENCES `content` (`Imdb_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Limiti per la tabella `movies`
--
ALTER TABLE `movies`
  ADD CONSTRAINT `movies_ibfk_1` FOREIGN KEY (`Imdb_ID`) REFERENCES `content` (`Imdb_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Limiti per la tabella `seasons`
--
ALTER TABLE `seasons`
  ADD CONSTRAINT `seasons_ibfk_1` FOREIGN KEY (`Imdb_ID`) REFERENCES `content` (`Imdb_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `seasons_ibfk_2` FOREIGN KEY (`Imdb_ID_season`) REFERENCES `episodes` (`Imdb_ID_season`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
