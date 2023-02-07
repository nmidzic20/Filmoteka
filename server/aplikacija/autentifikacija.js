const konst = require("../konstante.js");
const mail = require("./moduli/mail.js")
const kodovi = require("./moduli/kodovi.js")
//const portRest = require(konst.dirPortova + "portovi_rest.js").nmidzic20;
const portRest = 4300;
const url = "http://localhost:" + portRest + "/api";
const totp = require("./moduli/totp.js");
const Konfiguracija = require("../konfiguracija.js");

class Autentifikacija 
{
    async dodajKorisnika(korisnik, token) 
    {
        let tijelo = {
            ime: korisnik.ime,
            prezime: korisnik.prezime,
            lozinka: kodovi.kreirajSHA256(korisnik.lozinka, korisnik.korime),
            email: korisnik.email,
            korime: korisnik.korime,
            aktivan: 1, //u zadaci1 je 0 dok se ne aktivira
            blokiran: 0, 
            prijavljen: 0,
            datum_registracije: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        console.log("AUTENTIF " + korisnik.lozinka);

        let aktivacijskiKod = kodovi.dajNasumceBroj(10000, 99999);
        tijelo["aktivacijskiKod"] = aktivacijskiKod;
        let tajniTOTPkljuc = totp.kreirajTajniKljuc(korisnik.korime);
        tijelo["TOTPkljuc"] = tajniTOTPkljuc;

        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");

        zaglavlje.set("Authorization",token);

        let parametri = {
            method: 'POST',
            body: JSON.stringify(tijelo),
            headers: zaglavlje
        }
        let odgovor = await fetch(url + "/korisnici", parametri)

        if (odgovor.status == 200) {
            console.log("Korisnik ubačen na servisu");
            //angular
            //let mailPoruka = "aktivacijski kod:" + aktivacijskiKod
                //+ " http://localhost:4301/aktivacijaRacuna?korime=" + korisnik.korime + "&kod=" + aktivacijskiKod
            //mailPoruka += " TOTP Kljuc: " + tajniTOTPkljuc;
            //let poruka = await mail.posaljiMail("matnovak@foi.hr", korisnik.email,
                //"Aktivacijski kod", mailPoruka);
            return tijelo;
        } else {
            console.log(odgovor.status);
            console.log(await odgovor.text());
            return null;
        }
    }

    async aktivirajKorisnickiRacun(korime, kod) {
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let parametri = {
            method: 'PUT',
            body: JSON.stringify({ aktivacijskiKod: kod}),
            headers: zaglavlje
        }

        return await fetch(url + "/korisnici/" + korime + "/aktivacija", parametri)
    }

    async prijaviKorisnika(korime, lozinka, token) 
    {
        lozinka = kodovi.kreirajSHA256(lozinka, korime);
        let tijelo = {
            lozinka: lozinka,
        };
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");

        zaglavlje.set("Authorization",token);

        let parametri = {
            method: 'POST',
            body: JSON.stringify(tijelo),
            headers: zaglavlje
        }
        let odgovor = await fetch("http://localhost:" + portRest + "/api/korisnici/" + korime + "/prijava", parametri)

        console.log("AUTH " + lozinka);

        if (odgovor.status == 200) 
        {
            return await odgovor.text();
        } else {
            return false;
        }
    }

    async vratiTOTPKljucKorisnika(korime, token)
    {
        let korisnik = await this.vratiKorisnika(korime, token);
        let totp = korisnik.totp;
        return totp;
    }

    async provjeriKorisnikAktivan(korime, token)
    {
        let korisnik = await this.vratiKorisnika(korime, token);
        let aktivan = korisnik.aktivan;
        return aktivan;
    }

    async vratiKorisnika(korime, token)
    {
        let zaglavlje = new Headers();

        zaglavlje.set("Authorization",token);

        let parametri = { method: 'GET', headers: zaglavlje };

        let odgovor = await fetch(url + "/korisnici/" + korime, parametri);
        let korisnikString = await odgovor.text();
        let korisnik = JSON.parse(korisnikString);
        return korisnik;
    }

}

module.exports = Autentifikacija;