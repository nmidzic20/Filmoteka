let url = "http://spider.foi.hr:12125/api";
let poruka;

window.addEventListener("load", async () => {
    poruka = document.getElementById("poruka");
    dajFilmove(1);
    document.getElementById("filter").addEventListener("keyup", (event) => { dajFilmove(1) });
});

async function dajFilmove(str) 
{
    let parametri = { method: 'POST' }
    parametri = await dodajToken(parametri);
    let odgovor = await fetch("/filmoviPretrazivanje?str=" + str + "&filter=" + dajFilter(), parametri);
    if (odgovor.status == 200) {
        let podaci = await odgovor.text();
        podaci = JSON.parse(podaci);
        prikaziFilmove(podaci.results);
        prikaziStranicenje(podaci.page, 500, "dajFilmove");
    } 
    else if (odgovor.status == 401) 
    {
        document.getElementById("sadrzaj").innerHTML="";
        poruka.innerHTML = "Neautorizirani pristup! Prijavite se!"
    } else {
        poruka.innerHTML = "Greška u dohvatu filmova!"
    }
}

function prikaziFilmove(filmovi) 
{
    let glavna = document.getElementById("sadrzaj");
    let tablica = "<table border=1>";
    tablica += "<tr><th>Id</th><th>Jezik</th><th>Naslov original</th><th>Naslov</th><th>Opis</th><th>Poster</th><th>Datum</th></tr>"
    for (let f of filmovi) {
        tablica += "<tr>";
        tablica += "<td>" + f.id + "</td>"
        tablica += "<td>" + f.original_language + "</td>"
        tablica += "<td>" + f.title + "</td>"
        tablica += "<td>" + f.original_title + "</td>"
        tablica += "<td>" + f.overview + "</td>"
        tablica += "<td><img src='https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + f.poster_path + "' width='100' alt='slika_" + f.title + "'/></td>"
        tablica += "<td>" + f.release_date + "</td>"
        tablica += "<td><button onClick='dodajUbazu(" + f.id + ")'>Dodaj u bazu</button></td>"
        tablica += "</tr>";
    }
    tablica += "</table>";

    sessionStorage.dohvaceniFilmovi = JSON.stringify(filmovi);

    glavna.innerHTML = tablica;
}

async function dodajUbazu(idFilma) 
{

    let filmovi = JSON.parse(sessionStorage.dohvaceniFilmovi);
    for (let film of filmovi) 
    {
        if (idFilma == film.id) 
        {            
            let parametri = { method: 'POST', body: JSON.stringify(film) };
            parametri = await dodajToken(parametri);
            parametri.headers.set("Content-Type", "application/json"); 

            let odgovor = await fetch("/dodajFilm", parametri);

            if (odgovor.status == 200) 
            {
                let podaci = await odgovor.text();
                poruka.innerHTML = "Film " + film.title + " dodan u bazu!";
            } 
            else 
            {
                let podaci = await odgovor.text();
                poruka.innerHTML = JSON.parse(podaci).greska;
            }
            break;
        }
    }
}

function dajFilter() 
{
    return document.getElementById("filter").value;
}