const konst= require("../konstante.js");
const express = require(konst.dirModula + 'express');
const sesija = require(konst.dirModula+'express-session');
const kolacici = require(konst.dirModula+'cookie-parser');
const Konfiguracija = require("../konfiguracija");
//const portovi = require(konst.dirPortova + "portovi.js");
const htmlUpravitelj = require("./htmlUpravitelj.js");
const fetchUpravitelj = require("./fetchUpravitelj.js");
const putanja = require('path');
const jwt = require("./moduli/jwt");
//const port = portovi.nmidzic20;
//const portRest = require(konst.dirPortova + "portovi_rest.js").nmidzic20;
const host_name = "http://localhost:"; //"http://spider.foi.hr:"
const server = express();

const cors = require(konst.dirModula+'cors');
server.use(cors());

function pokreniServer() {

    server.use(express.urlencoded({ extended: true }));
    server.use(express.json());
    server.use(kolacici())
    server.use(sesija({
        secret: konst.tajniKljucSesija, 
        saveUninitialized: true,
        cookie: {  maxAge: 1000 * 60 * 60 * 3 },
        resave: false
    }));

    
    
    pripremiPutanjePocetna();
    pripremiPutanjeAutentifikacija();
    pripremiPutanjePretrazivanjeFilmova();
    pripremiPutanjeProfil();
    pripremiPutanjeZanrovi();

    server.use('/slike',express.static(__dirname + '/slike'));
    server.use('/posteri',express.static(__dirname + '/posteri'));
    //server.use('/posteri',express.static(putanja.join(__dirname, './posteri')));
    console.log(putanja.join(__dirname, './posteri'))
    server.use('/dokumentacija',express.static(putanja.join(__dirname, './dokumentacija')));
    server.use("/js", express.static(__dirname + "/js"));

    server.post('/galerijaSlikaURL/:id', htmlUpravitelj.galerijaSlikaURL); 

    //angular
    server.use(express.static('angular/'));
    server.get("*", (zahtjev, odgovor) => {
        odgovor.sendFile(__dirname + '/angular/');
    });

    



    server.use((zahtjev, odgovor) => {
        odgovor.status(404);
        var poruka = { greska: "Stranica nije pronađena!" };
        odgovor.send(JSON.stringify(poruka));
    });

    const port = konf.dajKonf()["app.port"];

    server.listen(port, () => {
        console.log(`Server pokrenut na portu: ${port}`);
    });
}

let konf = new Konfiguracija();
konf.ucitajKonfiguraciju()
    .then(
        () => konf.provjeriPodatkeKonfiguracije(konf.dajKonf(),"app")
    ).catch((greska) => {
        console.error(greska);
        process.exit();
    })
    .then(
        async () => {await probniZahtjevREST()}
    )
    .then(pokreniServer).catch((greska) => {
        console.log(greska);
        if (process.argv.length == 2)
            console.error("Potrebno je dati naziv datoteke");
        else
            console.error("Nije moguće otvoriti datoteku: " + greska.path);
        process.exit()
    });


async function probniZahtjevREST()
{

    const portRest = konf.dajKonf()["rest.port"];

    let restKorime = konf.dajKonf()["rest.korime"];
    let restLozinka = konf.dajKonf()["rest.lozinka"];
    
    let token = jwt.kreirajToken(restKorime);
    let zaglavlje = new Headers();
    zaglavlje.set("Authorization", token);

    let probnaPutanja = host_name + portRest + "/api/zanr?korime="+restKorime+"&lozinka="+restLozinka;
    fetch(probnaPutanja, {method:"GET", headers: zaglavlje})
    .then(async (odgovor) => 
    {
        let odg_tekst = await odgovor.text();
        switch (odgovor.status)
        {
            case 200:
                break;
            default:
                console.error("Greska : " + odg_tekst + "\nNe pokrećem server");
                process.exit();
        }
    })
    .catch(greska => console.error("Greska kod dohvata " + greska));
}

    
function pripremiPutanjePocetna() 
{
    //angular
    //server.get("/", htmlUpravitelj.pocetna);
    server.get("/app/dokumentacija", htmlUpravitelj.dokumentacija);
    server.get('/dajSveZanrove', (zahtjev, odgovor) => fetchUpravitelj.dajSveZanrove(zahtjev,odgovor,konf));
    server.get('/dajDvaFilma', (zahtjev, odgovor) => fetchUpravitelj.dajDvaFilma(zahtjev,odgovor,konf));
    server.get("/dajAppBrojStranica", (zahtjev, odgovor) => fetchUpravitelj.dajAppBrojStranica(zahtjev,odgovor,konf));
}

function pripremiPutanjeProfil() 
{
    //server.get("/profil", htmlUpravitelj.profil);
    server.post('/dajPrijavljenogKorisnika', (zahtjev, odgovor) => fetchUpravitelj.dajPrijavljenogKorisnika(zahtjev, odgovor, konf));
    server.post('/azurirajKorisnika', (zahtjev, odgovor) => fetchUpravitelj.azurirajKorisnika(zahtjev, odgovor, konf));
}

function pripremiPutanjePretrazivanjeFilmova() 
{
    //server.get('/filmoviPretrazivanje', htmlUpravitelj.filmoviPretrazivanje);
    server.post('/filmoviPretrazivanje', (zahtjev, odgovor) => fetchUpravitelj.filmoviPretrazivanje(zahtjev, odgovor, konf));
    server.post('/dodajFilm', (zahtjev, odgovor) => fetchUpravitelj.dodajFilm(zahtjev, odgovor, konf));

    //server.get('/filmoviPregled', htmlUpravitelj.filmoviPregled);
    server.post('/filmoviPregled', (zahtjev, odgovor) => fetchUpravitelj.filmoviPregled(zahtjev, odgovor, konf));
    //server.get('/galerijaSlika/:id', htmlUpravitelj.galerijaSlika);
    server.get('/filmInfo/:id', htmlUpravitelj.filmInfo);

    server.get('/slika', htmlUpravitelj.slika);
    server.post("/prijenosSlike", (zahtjev, odgovor) => fetchUpravitelj.prenesiSliku(zahtjev, odgovor, konf));

    //server.get('/filmoviPrijedlozi', htmlUpravitelj.filmoviPrijedlozi);
    server.post('/filmoviPrijedlozi', (zahtjev, odgovor) => fetchUpravitelj.filmoviPrijedlozi(zahtjev, odgovor, konf));
    server.put('/odobriFilm', (zahtjev, odgovor) => fetchUpravitelj.filmoviPrijedlozi(zahtjev, odgovor, konf));
    server.delete('/obrisiFilm', (zahtjev, odgovor) => fetchUpravitelj.filmoviPrijedlozi(zahtjev, odgovor, konf));

    server.post("/preuzmiPoster", (zahtjev, odgovor) => fetchUpravitelj.preuzmiPoster(zahtjev, odgovor, konf));
    server.post("/dajKonfiguraciju", (zahtjev, odgovor) => fetchUpravitelj.dajKonfiguraciju(zahtjev, odgovor, konf));
}

function pripremiPutanjeZanrovi()
{
    //server.get('/zanrovi', htmlUpravitelj.zanrovi);
    server.post('/dajSveZanroveAdmin', (zahtjev, odgovor) => fetchUpravitelj.dajSveZanroveAdmin(zahtjev,odgovor,konf));
    server.post('/dajZanroveTMDB', (zahtjev, odgovor) => fetchUpravitelj.zanroviTMDB(zahtjev, odgovor, konf));

    server.post('/dodajZanr', (zahtjev, odgovor) => fetchUpravitelj.zanrovi(zahtjev, odgovor, konf));
    server.put('/azurirajZanr', (zahtjev, odgovor) => fetchUpravitelj.zanrovi(zahtjev, odgovor, konf));
    server.delete('/obrisiZanr', (zahtjev, odgovor) => fetchUpravitelj.zanrovi(zahtjev, odgovor, konf));
    server.delete('/obrisiSveZanrove', (zahtjev, odgovor) => fetchUpravitelj.obrisiSveZanrove(zahtjev, odgovor, konf));
}

function pripremiPutanjeAutentifikacija() 
{
    //server.get("/registracija", htmlUpravitelj.registracija);
    server.post("/registracija", htmlUpravitelj.registracija);
    server.get("/odjava", htmlUpravitelj.odjava);
    //server.get("/prijava", htmlUpravitelj.prijava);
    server.post("/prijava", htmlUpravitelj.prijava);
    server.get("/getJWT", fetchUpravitelj.getJWT);
    server.get("/dajKorisnikaJWT", fetchUpravitelj.dajKorisnikaJWT);
    server.get("/aktivacijaRacuna", fetchUpravitelj.aktivacijaRacuna);

    server.get("/generirajJWT", (zahtjev, odgovor) => fetchUpravitelj.generirajJWT(zahtjev, odgovor, konf));
}
