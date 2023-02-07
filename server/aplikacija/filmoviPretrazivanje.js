const konst = require("../konstante.js");
//const portRest = require(konst.dirPortova + "portovi_rest.js").nmidzic20;
const portRest = 4300;
//const url = "http://spider.foi.hr:" + portRest + "/api";
const url = "http://localhost:" + portRest + "/api";
const kodovi = require("./moduli/kodovi.js");
const jwt = require("./moduli/jwt");

class FilmoviZanroviPretrazivanje 
{

    async dohvatiFilmove(stranica, kljucnaRijec = "",konf) 
    {
        let putanja = url + "/tmdb/filmovi" + dajRestKorimeLozinka(konf) + "&stranica=" + stranica + "&kljucnaRijec=" + kljucnaRijec;
        console.log(putanja);
        let odgovor = await fetch(putanja);
        let podaci = await odgovor.text();
        let filmovi = JSON.parse(podaci);
        //console.log(filmovi)
        return filmovi;
    }

    async dohvatiSveZanrove(konf)   
    {
        let odgovor = await fetch(url + "/zanr"+dajRestKorimeLozinka(konf));
        let podaci = await odgovor.text();
        console.log(podaci);
        let zanrovi = JSON.parse(podaci);
        return zanrovi;
    }


    async dohvatiNasumceFilm(zanr_id,konf) 
    {

        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let token = jwt.kreirajToken(konf.dajKonf()["rest.korime"]);
        zaglavlje.set("Authorization",token);
        let parametri = { method: 'GET', headers: zaglavlje};

        let appBrojStranica = konf.dajKonf()["app.broj.stranica"];    
        let odgovor = await fetch(url + "/filmovi"+dajRestKorimeLozinka(konf)+"&stranica=1&brojFilmova="+appBrojStranica+"&zanr="+zanr_id, parametri);
        
        let podaci = await odgovor.text();
        podaci = JSON.parse(podaci);

        let gornjaGranica = podaci.ukupno;

        let rez;
        if (podaci.filmovi.length > 0)
        {
            let indeks1 = kodovi.dajNasumceBroj(0,gornjaGranica-1);
            let indeks2 = kodovi.dajNasumceBroj(0,gornjaGranica-1);
            rez = [podaci.filmovi[indeks1],podaci.filmovi[indeks2]];
        }
        else
            rez = [{"naziv":"Trenutno u bazi nema filmova za ovaj žanr"},{}];

        //console.log(JSON.stringify(rez));
    
        return rez;
    }

    async dohvatiFilmoveIzBaze(zahtjev, odgovor, konf)
    {
        let str = zahtjev.query.stranica;
        let dioNazivaFilma = zahtjev.query.filter;
        let datum = zahtjev.query.datum;
        let zanr = zahtjev.query.zanr;
        let sortiraj = zahtjev.query.sortiraj;

        let brojFilmova = konf.dajKonf()["app.broj.stranica"];
        console.log("fetch - filmovi pregled " + JSON.stringify(zahtjev.query));

        let putanja = url + "/filmovi" + dajRestKorimeLozinka(konf) + 
            "&stranica=" + str + "&brojFilmova=" + brojFilmova +
            "&datum=" + datum + "&zanr=" + zanr + "&naziv=" + dioNazivaFilma + "&sortiraj=" + sortiraj;

        console.log(putanja);
        let odg = await fetch(putanja);
        let podaci = await odg.text();
        podaci = JSON.parse(podaci);
        return podaci;
    }

}

function dajRestKorimeLozinka(konf)
{
    let konfPodaci = konf.dajKonf();
    let restKorimeLozinka = "?korime=" + konfPodaci["rest.korime"] + "&lozinka=" + konfPodaci["rest.lozinka"];
    return restKorimeLozinka;
}


module.exports = FilmoviZanroviPretrazivanje;