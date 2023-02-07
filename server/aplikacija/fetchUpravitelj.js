const FilmoviPretrazivanje = require("./filmoviPretrazivanje.js");
const jwt = require("./moduli/jwt.js");
const Autentifikacija = require("./autentifikacija.js")
let auth = new Autentifikacija();
let fp = new FilmoviPretrazivanje();
const kodovi = require("./moduli/kodovi.js")
const konst = require("../konstante.js");
//const portRest = require(konst.dirPortova + "portovi_rest.js").nmidzic20;
const portRest = 4300;
//const url = "http://spider.foi.hr:" + portRest + "/api";
const url = "http://localhost:" + portRest + "/api";
const ds = require("fs");
const formidable = require(konst.dirModula +'formidable');


exports.aktivacijaRacuna = async function (zahtjev, odgovor) {
    console.log(zahtjev.query);
    let korime = zahtjev.query.korime;
    let kod = zahtjev.query.kod;

    let poruka = await auth.aktivirajKorisnickiRacun(korime, kod);
    console.log(poruka);

    if (poruka.status == 200) {
        odgovor.send(await poruka.text());
    } else {
        odgovor.send(await poruka.text());
    }
}

exports.dajSveZanrove = async function (zahtjev, odgovor,konf) {
    odgovor.json(await fp.dohvatiSveZanrove(konf));
}

exports.dajSveZanroveAdmin = async function (zahtjev, odgovor,konf) {
    if (!jwt.provjeriToken(zahtjev))
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else if (jwt.provjeriUlogu(zahtjev) != 1)
    {
        odgovor.status(403);
        odgovor.json({ greska: "Korisnik nije administrator" });
    }
    else
        odgovor.json(await fp.dohvatiSveZanrove(konf));
}

exports.dajDvaFilma = async function (zahtjev, odgovor, konf) 
{
    odgovor.json(await fp.dohvatiNasumceFilm(zahtjev.query.zanr, konf))
}

exports.getJWT = async function (zahtjev, odgovor) 
{
    odgovor.type('json');
    if (zahtjev.session.jwt != null) 
    {
        console.log("Ima sesija ");
        let k = { korime: jwt.dajTijelo(zahtjev.session.jwt).korime };
        let noviToken = jwt.kreirajToken(k)
        odgovor.send({ ok: noviToken });
        return
    } 
    else console.log("SESIJA :( " + JSON.stringify(zahtjev.session));
    odgovor.status(401);
    odgovor.send({ greska: "nemam token!" });
}

//za angular
exports.dajKorisnikaJWT = async function (zahtjev, odgovor) 
{
    odgovor.type('json');
    if (zahtjev.session.jwt != null) 
    {
        console.log("Ima sesija ");
        let k = { korime: jwt.dajTijelo(zahtjev.session.jwt).korime, uloga: jwt.dajTijelo(zahtjev.session.jwt).uloga };
        odgovor.send(JSON.stringify({ korisnik: k }));
        return
    } 
    else console.log("SESIJA :( " + JSON.stringify(zahtjev.session));
    odgovor.status(401);
    odgovor.send({ greska: "nemam token!" });
}

exports.filmoviPretrazivanje = async function (zahtjev, odgovor,konf) 
{
        if (!jwt.provjeriToken(zahtjev)) 
        {
            odgovor.status(401);
            odgovor.json({ greska: "Neautorizirani pristup" });
        } 
        else 
        {
            let str = zahtjev.query.str;
            let filter = zahtjev.query.filter;
            console.log(zahtjev.query)
            odgovor.json(await fp.dohvatiFilmove(str,filter,konf))
        }
}

exports.dodajFilm = async function (zahtjev, odgovor, konf) 
{
    if (!jwt.provjeriToken(zahtjev)) 
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup! Prijavite se!" });
    } 
    else 
    {
        zahtjev.body["korisnik_dodao"] = jwt.dajTijelo(zahtjev.session.jwt).korime;

        let putanja = url + "/filmovi" + dajRestKorimeLozinka(konf);

        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json"); 

        let token = jwt.kreirajToken(konf.dajKonf()["rest.korime"]);
        zaglavlje.set("Authorization",token);

        let parametri = { method: 'POST', body: JSON.stringify(zahtjev.body), headers: zaglavlje }; //u bodyju prenosimo film koji smo dobili
        
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
    }
}

exports.dajPrijavljenogKorisnika = async function (zahtjev, odgovor, konf) 
{
    if (zahtjev.session.jwt == null || !jwt.provjeriToken(zahtjev)) 
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else 
    {
        let korime = jwt.dajTijelo(zahtjev.session.jwt).korime;
        let putanja = url + "/korisnici/" + korime + dajRestKorimeLozinka(konf);

        let zaglavlje = new Headers();
        let token = jwt.kreirajToken(konf.dajKonf()["rest.korime"]);
        zaglavlje.set("Authorization", token);

        let parametri = { method: 'GET', headers: zaglavlje };

        let odg = await fetch(putanja, parametri);
        let korisnik = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(korisnik);
        }
        else
            odgovor.send(korisnik);
    }
}

exports.filmoviPretrazivanje = async function (zahtjev, odgovor,konf) 
{
        if (!jwt.provjeriToken(zahtjev)) 
        {
            odgovor.status(401);
            odgovor.json({ greska: "Neautorizirani pristup" });
        } 
        else 
        {
            let str = zahtjev.query.str;
            let filter = zahtjev.query.filter;
            console.log(zahtjev.query);
            odgovor.json(await fp.dohvatiFilmove(str,filter,konf));
        }
}

exports.filmoviPrijedlozi = async function (zahtjev, odgovor, konf) 
{
    if (!jwt.provjeriToken(zahtjev))
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else if (jwt.provjeriUlogu(zahtjev) != 1)
    {
        odgovor.status(403);
        odgovor.json({ greska: "Korisnik nije administrator" });
    }
    else if (zahtjev.method == "POST")
    {
        odgovor.json(await fp.dohvatiFilmoveIzBaze(zahtjev,odgovor,konf));
    }
    else if (zahtjev.method == "PUT")
    {
        let idFilma = zahtjev.body.tmdb_id;
        let putanja = url + "/filmovi/" + idFilma + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = { method: 'PUT', body: JSON.stringify(zahtjev.body), headers: zaglavlje };         
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
        
    }
    else if (zahtjev.method == "DELETE")
    {
        let idFilma = zahtjev.body.tmdb_id;
        let putanja = url + "/filmovi/" + idFilma + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
    
        let parametri = { method: 'DELETE' };       
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
    }
}

exports.filmoviPregled = async function (zahtjev, odgovor, konf) 
{
    if (!jwt.provjeriToken(zahtjev)) 
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else 
    {
        odgovor.json(await fp.dohvatiFilmoveIzBaze(zahtjev,odgovor,konf));
    }
}


function dajHashNazivSlike(korime)
{
    let datum = new Date().toISOString().split('T')[0];
    let vrijeme = new Date();
    let naziv = datum + "_" + kodovi.kreirajSHA256(vrijeme.toString(),korime);
    return naziv;
}

exports.prenesiSliku = async function (zahtjev, odgovor) 
{
    console.log("prenesi sliku fetch upravitelj");
    
    let obrazac = new formidable.IncomingForm();

    console.log("obrazac " + obrazac + " " + JSON.stringify(obrazac));

    obrazac.parse(zahtjev, (greska, parametri, datoteke) => {

        if (greska)
        {
            odgovor.send("Greska u prijenosu<br><a href='/slika'>Povratak na prijenos</a>");
            return;
        }
        else
        {
            odgovor.type("html");

            let korime = jwt.dajTijelo(zahtjev.session.jwt).korime;
            console.log("KORIME " + korime + " " + parametri + " " + JSON.stringify(parametri));
            let idFilma = parametri["id_film"].split("|")[0];
            let nazivFilma = parametri["id_film"].split("|")[1];

            let dozvoljeneEkstenzije = ["jpg", "jpeg", "png", "gif"];

            console.log("GALERIJA SLIKA FETCH " + idFilma + " " + nazivFilma);

            let ekstenzija = datoteke.slika.originalFilename.split(".")[1];

            console.log("EXT " + ekstenzija);

            let slikaIme = dajHashNazivSlike(korime) + "." + ekstenzija;

            console.log("SLIKA IME " + slikaIme);

            if (datoteke.slika.size > 512000) 
            {
                odgovor.send("Veličina slike ne može biti preko 500KB!<br><a href='/slika'>Povratak na prijenos</a>");
            }
            else if (!dozvoljeneEkstenzije.some(e => e == ekstenzija))
            {
                odgovor.send("Dozvoljene ekstenzije: " + dozvoljeneEkstenzije + "<br><a href='/slika'>Povratak na prijenos</a>");
            }
            else
            {
                let tmpPutanja = datoteke.slika.filepath;
                if(!ds.existsSync("slike"))
                {
                    ds.mkdirSync("slike");
                } 
                let odredisnaPutanja = 'slike/' + idFilma + "/" + korime;

                if (!ds.existsSync(odredisnaPutanja))
                {
                    ds.mkdirSync(odredisnaPutanja,{ recursive: true });
                }

                let slikaPutanja = odredisnaPutanja + "/" + slikaIme;
                try
                {
                    ds.cpSync(tmpPutanja, slikaPutanja);
                    if (ds.existsSync(odredisnaPutanja))                   
                        odgovor.redirect("/galerijaSlika/" + idFilma + "?film="+nazivFilma);
                    else 
                        odgovor.send("Greška u prijenosu!<br><a href='/slika'>Povratak na prijenos</a>");
                }
                catch (greska)
                {
                    odgovor.send("Greska u kopiranju!<br><a href='/slika'>Povratak na prijenos</a>");
                }
            }  
        }

    });

}

exports.zanrovi = async function (zahtjev,odgovor,konf)
{
    if (!jwt.provjeriToken(zahtjev))
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else if (jwt.provjeriUlogu(zahtjev) != 1)
    {
        odgovor.status(403);
        odgovor.json({ greska: "Korisnik nije administrator" });
    }
    else if (zahtjev.method == "PUT")
    {
        let id = zahtjev.body.z_tmdb_id;
        let putanja = url + "/zanr/" + id + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = { method: 'PUT', body: JSON.stringify(zahtjev.body), headers: zaglavlje };         
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
        
    }
    else if (zahtjev.method == "DELETE")
    {
        let idZanra = zahtjev.body.z_tmdb_id;
        let putanja = url + "/zanr/" + idZanra + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let parametri = { method: 'DELETE' };      
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
    }
    else if (zahtjev.method == "POST")
    {
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = { method: 'POST', body: JSON.stringify(zahtjev.body), headers: zaglavlje };
        let putanja = url + "/zanr" + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
    
    }
}

exports.obrisiSveZanrove = async function (zahtjev, odgovor, konf) 
{
    if (!jwt.provjeriToken(zahtjev))
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else if (jwt.provjeriUlogu(zahtjev) != 1)
    {
        odgovor.status(403);
        odgovor.json({ greska: "Korisnik nije administrator" });
    }
    else
    {
        let putanja = url + "/zanr" + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let parametri = { method: 'DELETE' };      
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
    }
}

exports.zanroviTMDB = async function (zahtjev, odgovor, konf) 
{
    if (!jwt.provjeriToken(zahtjev))
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else if (jwt.provjeriUlogu(zahtjev) != 1)
    {
        odgovor.status(403);
        odgovor.json({ greska: "Korisnik nije administrator" });
    }
    else
    {
        let putanja = url + "/tmdb/zanr" + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let odg = await fetch(putanja);
        let zanrovi = await odg.text();
        odgovor.send(zanrovi);
    }
}


exports.azurirajKorisnika = async function (zahtjev, odgovor, konf) 
{
    if (!jwt.provjeriToken(zahtjev)) 
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup! Prijavite se!" });
    } 
    else 
    {
        let korime = jwt.dajTijelo(zahtjev.session.jwt).korime;
        let putanja = url + "/korisnici/" + korime + dajRestKorimeLozinka(konf);
        console.log(putanja + " " + zahtjev.body.id);

        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        zaglavlje.set("Authorization", zahtjev.get("Authorization"));

        let parametri = { method: 'PUT', body: JSON.stringify(zahtjev.body), headers: zaglavlje };         
        let odg = await fetch(putanja, parametri);
        let odg_tekst = await odg.text();

        if (odg.status != 200)
        {
            odgovor.status(odg.status);
            odgovor.send(odg_tekst);
        }
        else
            odgovor.json({ok: "OK"});
    }
}

exports.preuzmiPoster = async function(zahtjev,odgovor,konf)
{
    if (!jwt.provjeriToken(zahtjev))
    {
        odgovor.status(401);
        odgovor.json({ greska: "Neautorizirani pristup" });
    } 
    else if (jwt.provjeriUlogu(zahtjev) != 1)
    {
        odgovor.status(403);
        odgovor.json({ greska: "Korisnik nije administrator" });
    }
    else
    {
        let putanja = url + "/tmdb/filmovi" + dajRestKorimeLozinka(konf) + "&id=" + zahtjev.body.tmdb_id + "&poster_path=" + zahtjev.body.putanja_postera;
        console.log(putanja + " " + zahtjev.body + " " + JSON.stringify(zahtjev.body));
        let odg = await fetch(putanja);
        await odg.text();
        odgovor.send(odg);
    }
}

exports.dajAppBrojStranica = async function (zahtjev, odgovor, konf)
{
    odgovor.type('json');
    let podaci = konf.dajKonf();
	let appBrojStranica = podaci["app.broj.stranica"];
    odgovor.send({"appBrojStranica":appBrojStranica});

}

exports.dajKonfiguraciju = async function (zahtjev, odgovor,konf) 
{
    odgovor.type('json');
    if (zahtjev.session.jwt != null) 
    {
        let podaci = konf.dajKonf();
        odgovor.send(JSON.stringify(podaci));
    } 
    else
    {
        odgovor.status(401);
        odgovor.send({ greska: "nemam token!" });
    }
}

exports.generirajJWT = async function (zahtjev, odgovor, konf)
{
    odgovor.type('json');
    let jwtToken = jwt.kreirajToken(konf.dajKonf()["rest.korime"]);
    odgovor.send({ token: jwtToken});
}

function dajRestKorimeLozinka(konf)
{
    let konfPodaci = konf.dajKonf();
    let restKorimeLozinka = "?korime=" + konfPodaci["rest.korime"] + "&lozinka=" + konfPodaci["rest.lozinka"];
    return restKorimeLozinka;
}
