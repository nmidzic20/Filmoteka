let url = "http://spider.foi.hr:12125";
let poruka;
let podaci;

window.addEventListener("load", async () =>
{
    poruka = document.getElementById("poruka");
    let profil = document.getElementById("korisnikPodaci");
    let prikaz = "<ul>";
    let korisnik = await dohvatiPrijavljenogKorisnika();
    
    if (korisnik == null)
    {
        profil.innerHTML="";
        poruka.innerHTML = "Neautorizirani pristup! Prijavite se!";
    }
    else
    {
        korisnik = JSON.parse(korisnik);
        podaci = {
            "KORISNIČKO IME" : korisnik.korime,
            "IME" : korisnik.ime,
            "PREZIME" : korisnik.prezime,
            "E-MAIL" : korisnik.email,
            "DATUM REGISTRACIJE" : korisnik.datum_registracije
        };

        for (let p in podaci)
        {
            prikaz += "<li>";
            prikaz += "<label>"+p+"&nbsp&nbsp&nbsp";
            if (!p.includes("KORISNIČKO") && !p.includes("E-MAIL") && !p.includes("DATUM"))
                prikaz += "<input type='text' id='" + p + "' value='" + podaci[p] + "'/></label>";
            else
                prikaz += podaci[p];
            prikaz += "</li>"    
        }
        prikaz += "<br><button onClick='azuriraj()'>Spremi</button>";
        profil.innerHTML = prikaz + "</ul>";
        console.log(prikaz);
    }

});


async function dohvatiPrijavljenogKorisnika()
{
    let parametri = { method: 'POST' }
    parametri = await dodajToken(parametri);
    let odgovor = await fetch(url+"/dajPrijavljenogKorisnika", parametri);
    if (odgovor.status == 200)
    {
        let podaci = await odgovor.text();
        let korisnik = JSON.parse(podaci);
        return korisnik;
    }
    else
        return null;
}

async function azuriraj()
{
    let ime = document.getElementById("IME").value;
    let prezime = document.getElementById("PREZIME").value;
    console.log("ime " + ime + " imepodatak " + podaci["IME"]);

    let tijelo = {};
    tijelo.ime = (ime == null || ime == "" || ime == undefined) ? podaci["IME"] : ime;
    tijelo.prezime = (prezime == null || prezime == "" || prezime == undefined) ? podaci["PREZIME"] : prezime;

    console.log("TIJELO " + JSON.stringify(tijelo));

    let parametri = { method: 'POST', body: JSON.stringify(tijelo) };
    parametri = await dodajToken(parametri);
    parametri.headers.set("Content-Type", "application/json");

    let odgovor = await fetch("/azurirajKorisnika", parametri);
    if (odgovor.status == 200) 
    {
        let podaci = await odgovor.text();
        poruka.innerHTML = "Podaci ažurirani!";
    } 
    else 
    {
        let podaci = await odgovor.text();
        poruka.innerHTML = JSON.parse(podaci).greska;
    }
    
}


