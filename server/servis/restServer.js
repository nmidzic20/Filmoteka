const konst = require("../konstante.js");
const express = require(konst.dirModula + 'express');
const Konfiguracija = require("../konfiguracija");
//const portovi = require(konst.dirPortova + "portovi_rest.js");
const restKorisnik = require("./korisnici/restKorisnik.js");
const restZanr = require("./zanrovi/restZanr.js");
const restFilm = require("./filmovi/restFilm.js");
const RestTMDB = require("./filmovi/restTMDB.js");

const jwt = require("../aplikacija/moduli/jwt");

//const port = portovi.nmidzic20;
const server = express();

const cors = require(konst.dirModula+'cors');
server.use(cors());

const Baza = require("./build/baza.js");
const { getJWT } = require("../aplikacija/fetchUpravitelj.js");
new Baza();


let konf = new Konfiguracija();
konf.ucitajKonfiguraciju()
    .then(
        () => konf.provjeriPodatkeKonfiguracije(konf.dajKonf(),"rest")
    ).catch((err) => {
        console.error(err);
        process.exit();
    })
    .then(pokreniServer).catch((err) => {
        console.error(err);
        if (process.argv.length == 2)
            console.error("Potrebno je unijeti i naziv konfiguracije")
        else    
            console.error("Nemoguće otvoriti datoteku");
        process.exit();
    }
);


function pokreniServer()
{
    server.use(express.urlencoded({ extended: true }));
    server.use(express.json());
    
    server.get("/api", provjeriTokenFunkcija);
    pripremaPutanjeResursKorisnika();
    pripremiPutanjeResursTMDB();
    pripremaPutanjeResursZanrova();
    pripremaPutanjeResursFilmova();

    server.use((zahtjev, odgovor) => {
        odgovor.status(404)
        var odg = { greska: "Stranica nije pronađena!" }
        odgovor.send(JSON.stringify(odg));
    });

    const port = konf.dajKonf()["rest.port"];

    server.listen(port, () => {
        console.log(`Server pokrenut na portu: ${port}`);
    });
}

function provjeriTokenFunkcija(zahtjev, odgovor, next)
{
    console.log("provjeriTokenFunkcija")
    if (provjeraJWT(zahtjev)) 
        next();
    else 
    {
        console.log("projveriTokenFunkcija nije prosla")
        odgovor.status(401);
        odgovor.json({ greska: "nemam token!" });
    } 
}

function pripremiPutanjeResursTMDB() 
{
    let restTMDB = new RestTMDB(konf.dajKonf()["tmdb.apikey.v3"]);

    server.get("/api/tmdb", provjeriTokenFunkcija);

    server.get("/api/tmdb/zanr", restTMDB.getZanr.bind(restTMDB));
    //server.get("/api/tmdb/filmovi", provjeriTokenTMDB);
    server.get("/api/tmdb/filmovi", restTMDB.getFilmovi.bind(restTMDB));

    server.post("/api/tmdb/zanr", restTMDB.vratiMetodaNijeImplementirana);
    server.put("/api/tmdb/zanr", restTMDB.vratiMetodaNijeImplementirana);
    server.delete("/api/tmdb/zanr", restTMDB.vratiMetodaNijeImplementirana);

    server.post("/api/tmdb/filmovi", restTMDB.vratiMetodaNijeImplementirana);
    server.put("/api/tmdb/filmovi", restTMDB.vratiMetodaNijeImplementirana);
    server.delete("/api/tmdb/filmovi", restTMDB.vratiMetodaNijeImplementirana);

}


function pripremaPutanjeResursKorisnika()
{    
    /*server.get("/api/korisnici", (zahtjev, odgovor) => {
        let provjera = provjeriRestKorimeLozinka(zahtjev);
        if (provjera.status == 200) restKorisnik.getKorisnici(zahtjev,odgovor);
        else vratiPorukuGreske(provjera, odgovor);
    });*/
    server.get("/api/korisnici", restKorisnik.getKorisnici);
    server.post("/api/korisnici", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restKorisnik.postKorisnici(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.put("/api/korisnici", restKorisnik.putKorisnici);
    server.delete("/api/korisnici", restKorisnik.deleteKorisnici);

    server.get("/api/korisnici/:korime", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restKorisnik.getKorisnik(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.post("/api/korisnici/:korime", restKorisnik.postKorisnik);
    server.put("/api/korisnici/:korime", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restKorisnik.putKorisnik(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.delete("/api/korisnici/:korime", restKorisnik.deleteKorisnik);

    server.get("/api/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava);
    server.post("/api/korisnici/:korime/prijava", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restKorisnik.postKorisnikPrijava(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.put("/api/korisnici/:korime/prijava", restKorisnik.putKorisnikPrijava);
    server.delete("/api/korisnici/:korime/prijava", restKorisnik.deleteKorisnikPrijava);

    server.get("/api/korisnici/:korime/aktivacija", restKorisnik.getKorisnikAktivacija);
    server.post("/api/korisnici/:korime/aktivacija", restKorisnik.postKorisnikAktivacija);
    server.put("/api/korisnici/:korime/aktivacija", restKorisnik.putKorisnikAktivacija);
    server.delete("/api/korisnici/:korime/aktivacija", restKorisnik.deleteKorisnikAktivacija);
}

function pripremaPutanjeResursZanrova()
{
    server.get("/api/zanr", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restZanr.getZanrovi(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.post("/api/zanr", restZanr.postZanrovi);
    server.put("/api/zanr", restZanr.putZanrovi);
    server.delete("/api/zanr", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restZanr.deleteZanrovi(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });

    server.get("/api/zanr/:id", restZanr.getZanr);
    server.post("/api/zanr/:id", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restZanr.postZanr(zahtjev,odgovor);
        else
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.put("/api/zanr/:id", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restZanr.putZanr(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.delete("/api/zanr/:id", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restZanr.deleteZanr(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
}

function pripremaPutanjeResursFilmova()
{
    server.get("/api/filmovi", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restFilm.getFilmovi(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.post("/api/filmovi", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restFilm.postFilmovi(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.put("/api/filmovi", restFilm.putFilmovi);
    server.delete("/api/filmovi", restFilm.deleteFilmovi);

    server.get("/api/filmovi/:id", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restFilm.getFilm(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.post("/api/filmovi/:id", restFilm.postFilm);
    server.put("/api/filmovi/:id", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restFilm.putFilm(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
    server.delete("/api/filmovi/:id", (zahtjev, odgovor) => {
        if (provjeraJWT(zahtjev))
            restFilm.deleteFilm(zahtjev,odgovor);
        else 
        {
            odgovor.status(401);
            odgovor.json({ greska: "nemam token!" });
        }

    });
}

function provjeriRestKorimeLozinka(zahtjev)
{
    let korime = zahtjev.query.korime;
    let lozinka = zahtjev.query.lozinka;
    let status;
    let poruka = "";

    if (korime == null || lozinka == null)
    {
        status = 400;
        poruka = "Za pristup REST servisu unesite u formatu URL?korime={rest.korime}&lozinka={rest.lozinka}";
    }
    else if (korime != konf.dajKonf()["rest.korime"] || lozinka != konf.dajKonf()["rest.lozinka"])
    {
        status = 401;
        poruka = "Netočni korime i lozinka za pristup REST servisu";
    }
    else 
        status = 200;

    return {status: status, poruka: poruka};
}

function vratiPorukuGreske(provjera, odgovor)
{
    odgovor.status(provjera.status);
    let poruka = { greska: provjera.poruka };
    odgovor.send(JSON.stringify(poruka));
}

function provjeraJWT(zahtjev)
{
    let token = zahtjev.get("Authorization");
    console.log("HEADERS " + token);
    console.log("Jwt verify : " + jwt.provjeriToken(zahtjev));

    if (!token)
        return false;
    else if (!jwt.provjeriToken(zahtjev))
    {
        return false;
    }
    else 
        return true;
}