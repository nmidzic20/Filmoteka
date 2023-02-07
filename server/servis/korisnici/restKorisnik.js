const KorisnikDAO = require("./korisnikDAO.js");
//const kodovi = require("../aplikacija/moduli/kodovi.js")

exports.getKorisnici = function (zahtjev, odgovor) 
{
    odgovor.type("application/json");
    console.log("TEXT:"+ JSON.stringify(zahtjev.query));
    let kdao = new KorisnikDAO();
    kdao.dajSve().then((korisnici) => {
        console.log("korisnici: " + JSON.stringify(korisnici));
        odgovor.send(JSON.stringify(korisnici));
    });
}

exports.postKorisnici = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let podaci = zahtjev.body;
    let kdao = new KorisnikDAO();
    kdao.dodaj(podaci).then((poruka) => {
        odgovor.send(JSON.stringify(poruka));
    }).catch(greska => odgovor.send(JSON.stringify(greska)));
}

exports.putKorisnici = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.deleteKorisnici = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}



exports.getKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    console.log("TEXT:"+JSON.stringify(zahtjev.query));
    let kdao = new KorisnikDAO();
    let korime = zahtjev.params.korime;
    kdao.daj(korime).then((korisnik) => {
        console.log(korisnik);
        odgovor.send(JSON.stringify(korisnik));
    });
}

exports.postKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(405);
    let poruka = { greska: "metoda nije dopuštena" }
    odgovor.send(JSON.stringify(poruka));
}

exports.putKorisnik = function (zahtjev, odgovor) 
{
    odgovor.type("application/json")
    let korime = zahtjev.params.korime;
    let podaci = zahtjev.body;
    let kdao = new KorisnikDAO();
    kdao.azuriraj(korime, podaci).then((poruka) => {
        odgovor.send(JSON.stringify(poruka));
    });
}

exports.deleteKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}



exports.getKorisnikAktivacija = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.deleteKorisnikAktivacija = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.postKorisnikAktivacija = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(405);
    let poruka = { greska: "metoda nije dopuštena" }
    odgovor.send(JSON.stringify(poruka));
}

exports.putKorisnikAktivacija = async function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let korime = zahtjev.params.korime;
    let podaci = zahtjev.body;
    let kdao = new KorisnikDAO();

    let aktiviraj = false;

    await kdao.daj(korime).then((korisnik) => {
        console.log(zahtjev.body);

        if (korisnik != null)
        {
            if (korisnik.aktivan == 1)
            {
                odgovor.status(401)
                odgovor.send(JSON.stringify({greska: "Korisnik već aktiviran!"}));
                return;
            }
            else if (korisnik.aktivacijski_kod != podaci.aktivacijskiKod)
            {
                odgovor.status(401)
                odgovor.send(JSON.stringify({greska: "Krivi aktivacijski kod!"}));
                return;
            }
            else
                aktiviraj = true;
        }
        else
        {
            odgovor.status(401)
            odgovor.send(JSON.stringify({greska: "Krivi podaci!"}));
            return;
        }
        
    });

    if (aktiviraj) 
    {
        console.log("AKTIVIRANO");
        let kdao2 = new KorisnikDAO(); 
        kdao2.aktiviraj(korime).then((poruka) => {
            
            odgovor.send("Aktivacija uspješna");
        });

    }
        
}



exports.getKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.putKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.deleteKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.postKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let kdao = new KorisnikDAO();
    let korime = zahtjev.params.korime;
    kdao.daj(korime).then((korisnik) => {

        console.log(korisnik);
        if (korisnik != null)
            console.log("REST: " + korisnik.lozinka + zahtjev.body.lozinka);
        else 
            console.log("REST: korisnik je null");

        if (korisnik == null || zahtjev.body.lozinka == null)
        {
            odgovor.status(400);
            odgovor.send(JSON.stringify({greska: "Nevaljan zahtjev!"}));
        }
        else if (korisnik != null && korisnik.lozinka == zahtjev.body.lozinka)
        {
            odgovor.send(JSON.stringify(korisnik));
        }
        else if (korisnik.lozinka != zahtjev.body.lozinka)
        { 
            odgovor.status(401);
            odgovor.send(JSON.stringify({greska: "Neautoriziran pristup!"}));
        }
        
    });
}
