const ds = require("fs/promises");
const jwt = require("./moduli/jwt.js");
const totp = require("./moduli/totp.js");
const Autentifikacija = require("./autentifikacija.js");
let auth = new Autentifikacija();

const kodovi = require("./moduli/kodovi.js");
const { dir } = require("console");

const konst = require("../konstante.js");
//const portRest = require(konst.dirPortova + "portovi_rest.js").nmidzic20;
const portRest = 4300;
//const url = "http://spider.foi.hr:" + portRest + "/api";
const url = "http://localhost:" + portRest + "/api";

const putanja = require('path');


exports.pocetna = async function (zahtjev, odgovor) {
    let pocetna = await ucitajStranicu(zahtjev, "pocetna");
    odgovor.send(pocetna);
}

exports.profil = async function (zahtjev, odgovor) {
    let profil = await ucitajStranicu(zahtjev, "profil");
    odgovor.send(profil);
}

exports.registracija = async function (zahtjev, odgovor) 
{
    console.log(zahtjev.body)
    let greska = "";
    let registriraniKorisnik = null;
    if (zahtjev.method == "POST") 
    {
        registriraniKorisnik = await auth.dodajKorisnika(zahtjev.body, zahtjev.get("Authorization"));
        if (registriraniKorisnik != null) 
        {        
            console.log(JSON.stringify(registriraniKorisnik));
            //angular
            //odgovor.redirect("/prijava");
            //return;
        } else {
            greska = "Dodavanje nije uspjelo - provjerite podatke!";
        }
    }
    console.log("Greska kod registracije - html upr " + greska);

    //angular - izbačena aktivacija pa se odmah može vratiti korisnik za prijavu
    odgovor.send(JSON.stringify({"korisnik":registriraniKorisnik,"greska":greska}));

    //let stranica = await ucitajStranicu(zahtjev, "registracija", greska);
    //odgovor.send(stranica);
}

exports.odjava = async function (zahtjev, odgovor) {
    zahtjev.session.jwt = null;
    zahtjev.session.korisnik = null;
    zahtjev.session.korime = null;
    odgovor.redirect("/");
};

exports.prijava = async function (zahtjev, odgovor) {
    let greska = ""
    if (zahtjev.method == "POST") {
        var korime = zahtjev.body.korime;
        var lozinka = zahtjev.body.lozinka;
        var korisnik = await auth.prijaviKorisnika(korime, lozinka, zahtjev.get("Authorization"));

        console.log("HTML UPR KORISNIK " + korisnik);

        if (korisnik) 
        {     
            let korisnikAktivan = await auth.provjeriKorisnikAktivan(korime, zahtjev.get("Authorization"));

            if (!korisnikAktivan)
            {
                greska = "Korisnik nije aktiviran!";
            }
            else
            {
                /*angular
                let totpKljuc = await auth.vratiTOTPKljucKorisnika(korime, zahtjev.get("Authorization"));
                let totpKod = zahtjev.body.totp;

                if (!totp.provjeriTOTP(totpKod, totpKljuc)) 
                {
                    greska = "TOTP nije dobar!"
                } 
                else 
                {*/
                    let kor = JSON.parse(korisnik);
                    zahtjev.session.jwt = jwt.kreirajToken(kor)
                    zahtjev.session.korime = jwt.dajTijelo(zahtjev.session.jwt).korime;
                    zahtjev.session.uloga = jwt.dajTijelo(zahtjev.session.jwt).uloga;
                    //odgovor.redirect("/"); //angular
                    //return;
                //}
            }

        } 
        else
        {
            greska = "Netocni podaci!";
            korisnik = JSON.stringify(null);
        }
    }
    //angular
    else greska = "Angular - nije poslan POST ";

    console.log("HTML UPR GRESKA " + greska + " " + korisnik);

    odgovor.send(korisnik); //always .send... using return is a mistake!

    /*angular
    let stranica = await ucitajStranicu(zahtjev, "prijava", greska);
    odgovor.send(stranica);*/
}


exports.filmoviPretrazivanje = async function (zahtjev, odgovor) 
{
    let stranica = await ucitajStranicu(zahtjev, "filmovi_pretrazivanje");
    odgovor.send(stranica);
}

exports.filmoviPregled = async function (zahtjev, odgovor) 
{
    let stranica = await ucitajStranicu(zahtjev, "filmovi_pregled");
    odgovor.send(stranica);
}

exports.filmoviPrijedlozi = async function (zahtjev, odgovor) 
{
    let stranica = await ucitajStranicu(zahtjev, "filmovi_prijedlozi");
    odgovor.send(stranica);
}

exports.zanrovi = async function (zahtjev, odgovor)
{
    let stranica = await ucitajStranicu(zahtjev, "zanrovi");
    odgovor.send(stranica); 
}

exports.filmInfo = async function (zahtjev, odgovor)
{
    let stranica = await ucitajStranicu(zahtjev, "film");

    if (zahtjev.session.korime == null)
    {
        stranica = stranica.replace("#podaci#","Neautorizirani pristup! Prijavite se!");
        odgovor.send(stranica);
    }
    else
    {
        let id = zahtjev.params.id;
        let nazivFilma = zahtjev.query.film;

        let odg = await fetch(url+"/filmovi/"+id);
        let film = await odg.text();
        film = JSON.parse(film);

        let podaci = "";
        podaci += "<ul>";
        podaci += "<img alt='poster_filma' height='500' src='./posteri/"+ film.tmdb_id + ".jpg'><br>";
        podaci += "<a href='/galerijaSlika/"+film.tmdb_id+"?film="+nazivFilma+"'>Galerija slika</a>";
        for (f in film)
        {
            podaci += "<li>" + f + ": " + film[f] + "</li>";
        }
        podaci += "</ul>";

        stranica = stranica.replace("#podaci#", podaci);

        odgovor.send(stranica); 
        
    }

}


async function citajDir(dir)
{
    try 
    {
        return await ds.readdir(dir);

    } catch (greska) 
    {
        console.error('Greška tijekom čitanja direktorija! ', greska);
    }
}



exports.galerijaSlika = async function (zahtjev, odgovor)
{
    let stranica = await ucitajStranicu(zahtjev, "galerijaSlika");

    if (zahtjev.session.korime == null)
    {
        stranica = stranica.replace("#galerija#","Neautorizirani pristup! Prijavite se!");
        odgovor.send(stranica);
    }
    else
    {

        let idFilma = zahtjev.params.id;
        let nazivFilma = zahtjev.query.film;
        let datumOd = zahtjev.query.od;
        let datumDo = zahtjev.query.do;
        console.log("DATUMI " + datumOd + " " + datumDo);

        let glavniDir = './slike/'+idFilma;
        let slikePutanje = [];

        citajDir(glavniDir).then(async function (direktoriji) {
            //console.log("Nađeni direktoriji: " + direktoriji);
            let promiseovi = [];
            //direktoriji.forEach(async function (direktorij)
            for (direktorij of direktoriji)
            {
                //console.log("direktorij " +direktorij);
                direktorij = glavniDir+"/"+direktorij;
                //console.log("direktorij sada" +direktorij);
                let promise = citajDir(direktorij).then(function (datoteke)
                {
                    //console.log("Nađene datoteke: " + datoteke);
                    datoteke.forEach(function (dat) {
                        dat = direktorij + "/" + dat;
                        slikePutanje.push(dat);
                    });
                });
                await promise;
                //promiseovi.push(promise);
            };

            //await Promise.all(promiseovi);
            //console.log("SLIKE PUTANJE " + slikePutanje);

            let prikaz = "";
            for (p of slikePutanje)
            {
                /*let prikazi = true;
                if (datumOd != null && datumOd != "") prikazi = provjeriDatumOd(p, datumOd);
                if (prikazi && datumDo != null && datumDo != "") prikazi = provjeriDatumDo(p, datumDo);
                console.log("putanja " + p + " " + prikazi);
                if (prikazi)*/
                    prikaz += "<a href='/filmInfo/" + idFilma + "'><img alt='slika' height='300' src='." + p + "'></a>";                    
            }
            stranica = stranica.replace("#galerija#",prikaz);
            stranica = stranica.replace("<span id='film_id' style='display:none'></span>",
                "<span id='film_id' style='display:none'>" + idFilma + "</span>");
            stranica = stranica.replace("<span id='film_naziv' style='display:none'></span>",
                "<span id='film_naziv' style='display:none'>" + nazivFilma + "</span>");
            stranica = stranica.replace("Galerija slika", "Galerija slika za " + nazivFilma);
            //console.log("prikaz " + prikaz);
            odgovor.send(stranica); 

        }).catch(greska => {
            stranica = stranica.replace("#galerija#","Za ovaj film nije dodana nijedna slika");
            odgovor.send(stranica);
        });
    }

}

function dajDatumSlike(slika)
{
    let zadnjiSlash = slika.lastIndexOf('/');
    let datumSlike = slika.substring(zadnjiSlash+1).split("_")[0];
    datumSlike = new Date(datumSlike);
    console.log("datum  " + datumSlike);
    return datumSlike;
}

function provjeriDatumOd(slika, datumOd)
{
    let datumSlike = dajDatumSlike(slika);
    let usporedi = datumSlike.getTime() > Date.parse(datumOd);
    //console.log("Datum OD: " + datumSlike.getTime() + " " + Date.parse(datumOd) + " " + usporedi);
    return usporedi;
}

function provjeriDatumDo(slika, datumDo)
{
    let datumSlike = dajDatumSlike(slika);
    let usporedi = datumSlike.getTime() < Date.parse(datumDo);
    //console.log("Datum DO: " + datumSlike.getTime() + " " + Date.parse(datumDo) + " " + usporedi);
    return usporedi;
}

exports.galerijaSlikaURL = async function (zahtjev, odgovor)
{
    if (zahtjev.session.korime == null)
    {
        odgovor.send(JSON.stringify({poruka: "Neautorizirani pristup! Prijavite se!"}));
    }
    else
    {
        let idFilma = zahtjev.params.id;

        let datumOd = zahtjev.query.od;
        let datumDo = zahtjev.query.do;
        console.log("DATUMI " + datumOd + " " + datumDo);

        let glavniDir = './slike/'+idFilma;
        let slikePutanje = [];

        citajDir(glavniDir).then(async function (direktoriji) {
            //console.log("Nađeni direktoriji: " + direktoriji);
            let promiseovi = [];
            //direktoriji.forEach(async function (direktorij)
            for (direktorij of direktoriji)
            {
                //console.log("direktorij " +direktorij);
                direktorij = glavniDir+"/"+direktorij;
                //console.log("direktorij sada" +direktorij);
                let promise = citajDir(direktorij).then(function (datoteke)
                {
                    //console.log("Nađene datoteke: " + datoteke);
                    datoteke.forEach(function (dat) {
                        dat = direktorij + "/" + dat;
                        slikePutanje.push(dat);
                    });
                });
                await promise;
                //promiseovi.push(promise);
            };

            //await Promise.all(promiseovi);
            //console.log("SLIKE PUTANJE " + slikePutanje);

            let slikePutanjePoDatumu = [];

            for (p of slikePutanje)
            {
                let prikazi = true;
                if (datumOd != null && datumOd != "" && datumOd != "null") prikazi = provjeriDatumOd(p, datumOd);
                if (prikazi && datumDo != null && datumDo != "" && datumDo != "null") prikazi = provjeriDatumDo(p, datumDo);
                //console.log("putanja " + p + " " + prikazi);
                if (prikazi)
                    slikePutanjePoDatumu.push(p);

            }

            //console.log("prikaz " + prikaz);
            odgovor.send(JSON.stringify({slikePutanjePoDatumu})); 

        }).catch(greska => {
            odgovor.send(JSON.stringify({poruka:"Za ovaj film nije dodana nijedna slika"}));
        });
    }

}

exports.slika = async function (zahtjev, odgovor)
{
    let stranica = await ucitajStranicu(zahtjev, "slika");
    odgovor.send(stranica); 
}

exports.dokumentacija = async function (zahtjev, odgovor)
{
    let stranice = [ds.readFile(putanja.join(__dirname, "./dokumentacija/dokumentacija.html"), "UTF-8"),
        ds.readFile(__dirname + "/html/navigacija.html", "UTF-8")];
    let [stranica, nav] = await Promise.all(stranice);
    stranica = stranica.replace("#navigacija#", nav);   
    stranica = prilagodiNavigaciju(zahtjev, stranica);
    odgovor.send(stranica); 
}

async function ucitajStranicu(zahtjev, nazivStranice, poruka = "") 
{
    let stranice = [ucitajHTML(nazivStranice), ucitajHTML("navigacija")];
    let [stranica, nav] = await Promise.all(stranice);
    stranica = stranica.replace("#navigacija#", nav);   
    stranica = prilagodiNavigaciju(zahtjev, stranica);
    stranica = stranica.replace("#poruka#", poruka);
    return stranica;
}


function ucitajHTML(htmlStranica) 
{
    return ds.readFile(__dirname + "/html/" + htmlStranica + ".html", "UTF-8");
}


function prilagodiNavigaciju(zahtjev, stranica)
{
    if (!zahtjev.session.jwt)
    {
        stranica = stranica.replace('id="odjava"', 'id="odjava" style="display:none"');
        stranica = stranica.replace('id="prijava" style="display:none"', 'id="prijava"');
        stranica = stranica.replace('id="registracija" style="display:none"', 'id="registracija"');
        stranica = stranica.replace('id="profil"', 'id="profil" style="display:none"');
        stranica = stranica.replace('id="filmoviPretrazivanje"', 'id="filmoviPretrazivanje" style="display:none"');
        stranica = stranica.replace('id="filmoviPregled"', 'id="filmoviPregled" style="display:none"');
        stranica = stranica.replace('id="filmoviPrijedlozi"', 'id="filmoviPrijedlozi" style="display:none"');
        stranica = stranica.replace( 'id="zanrovi"','id="zanrovi" style="display:none"');
        stranica = stranica.replace( 'id="slika"','id="slika" style="display:none"');

    }
    else
    {
        stranica = stranica.replace('id="odjava" style="display:none"','id="odjava"');
        stranica = stranica.replace('id="prijava"','id="prijava" style="display:none"');
        stranica = stranica.replace('id="registracija"','id="registracija" style="display:none"');
        stranica = stranica.replace('id="profil" style="display:none"', 'id="profil"');
        stranica = stranica.replace('id="filmoviPretrazivanje" style="display:none"','id="filmoviPretrazivanje"');
        stranica = stranica.replace('id="filmoviPregled" style="display:none"', 'id="filmoviPregled"');
        stranica = stranica.replace('id="slika" style="display:none"','id="slika"');

        if (jwt.provjeriUlogu(zahtjev) == 1)
        {
            stranica = stranica.replace('id="filmoviPrijedlozi" style="display:none"', 'id="filmoviPrijedlozi"');
            stranica = stranica.replace('id="zanrovi" style="display:none"', 'id="zanrovi"');
        }
        else if (!stranica.includes('id="filmoviPrijedlozi" style="display:none"'))
        {
            stranica = stranica.replace('id="filmoviPrijedlozi"','id="filmoviPrijedlozi" style="display:none"');
            stranica = stranica.replace( 'id="zanrovi"','id="zanrovi" style="display:none"');
        }
    }
    return stranica;
}