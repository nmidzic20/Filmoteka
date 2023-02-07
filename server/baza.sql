CREATE TABLE IF NOT EXISTS `tip_korisnika` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `naziv` VARCHAR(20) NOT NULL,
  UNIQUE (`naziv`));


CREATE TABLE IF NOT EXISTS `korisnik` (
  `korime` VARCHAR(30) PRIMARY KEY,
  `ime` VARCHAR(50) NOT NULL,
  `prezime` VARCHAR(100) NOT NULL,
  `lozinka` TEXT NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `tip_korisnika_id` INT NOT NULL,
  `aktivan` TINYINT(1) NOT NULL,
  `blokiran` TINYINT(1) NOT NULL,
  `datum_registracije` DATETIME NOT NULL,
  `aktivacijski_kod` TEXT,
  `totp` TEXT,
  UNIQUE (`korime`),
  FOREIGN KEY (tip_korisnika_id) REFERENCES tip_korisnika (id));


CREATE TABLE IF NOT EXISTS `film` (
  `tmdb_id` INTEGER PRIMARY KEY,
  `naziv` TEXT NOT NULL,
  `korisnik_dodao` VARCHAR(30) NOT NULL,
  `datum_dodan` DATETIME NOT NULL,
  `odobren` TINYINT(1) NOT NULL,
  `odrasli_film` TINYINT(1) NULL,
  `putanja_pozadine` TEXT NULL,
  `budzet` VARCHAR(15) NULL,
  `pocetna_stranica` TEXT NULL,
  `imdb_id` INT NULL,
  `originalni_jezik` VARCHAR(5) NULL,
  `originalni_naslov` TEXT NULL,
  `sazetak` TEXT NULL,
  `popularnost` VARCHAR(10) NULL,
  `putanja_postera` TEXT NULL,
  `datum_izlaska` DATETIME NULL,
  `prihod` VARCHAR(20) NULL,
  `trajanje` INT NULL,
  `status` VARCHAR(20) NULL,
  `slogan` TEXT NULL,
  `video` TINYINT(1) NULL,
  `prosjek_glasova` DECIMAL NULL,
  `broj_glasova` INT NULL,
  UNIQUE (`tmdb_id`),
  CONSTRAINT `fk_film_korisnik1`
    FOREIGN KEY (`korisnik_dodao`)
    REFERENCES `korisnik` (`korime`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


CREATE TABLE IF NOT EXISTS `zanr` (
  `z_tmdb_id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `z_naziv` VARCHAR(50) NOT NULL,
  `originalni_naziv` VARCHAR(50) NOT NULL,
  UNIQUE (`z_naziv`),
  UNIQUE (`originalni_naziv`));


CREATE TABLE IF NOT EXISTS `film_zanr` (
  `zanr_id` INTEGER NOT NULL,
  `film_id` INTEGER NOT NULL,
  PRIMARY KEY (`zanr_id`, `film_id`),
  CONSTRAINT `fk_zanr_has_film_zanr1`
    FOREIGN KEY (`zanr_id`)
    REFERENCES `zanr` (`z_tmdb_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_zanr_has_film_film1`
    FOREIGN KEY (`film_id`)
    REFERENCES `film` (`tmdb_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);


INSERT INTO `tip_korisnika` (`id`, `naziv`) VALUES
(1, 'admin'),
(2, 'moderator'),
(3, 'korisnik');

INSERT INTO korisnik (korime, ime, prezime, lozinka, email, tip_korisnika_id, aktivan, blokiran,
datum_registracije, aktivacijski_kod, totp) VALUES
('neko', 'neki','neki', 'nesto', 'nesto',2,1,0,'2015-01-01T15:23:42','testni','test');


SELECT * FROM zanr;

SELECT * FROM korisnik;

INSERT INTO korisnik (korime, ime, prezime, lozinka, email, tip_korisnika_id, aktivan, blokiran,
datum_registracije, aktivacijski_kod, totp) VALUES
('admin', 'Test','Test', 'admin', 'te@foi.unizg.hr',1,1,0,'2015-01-01T15:23:42','testni','test');

INSERT INTO zanr (z_tmdb_id, z_naziv, originalni_naziv)
VALUES ('2','akcija','Action');

SELECT * FROM korisnik;










