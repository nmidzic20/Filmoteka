let poruka;

window.addEventListener("load", async () => {

    let spanZanr = document.getElementById("spanZanr");
    let spanZanrSadrzaj = "<select id='zanr'>";
    let odg = await fetch("/dajSveZanrove");
    let zanrovi = await odg.text();
    console.log("Zanrovi " + zanrovi);
    zanrovi = JSON.parse(zanrovi);
    spanZanrSadrzaj += "<option value='' selected>Svi žanrovi</option>";
    for (z of zanrovi)
        spanZanrSadrzaj += "<option value='" + z.z_tmdb_id + "'>" + z.z_naziv + "</option>";
    spanZanrSadrzaj += "</select>";

    spanZanr.innerHTML = spanZanrSadrzaj;

    poruka = document.getElementById("poruka");
    dajFilmove(1);
    document.getElementById("filter").addEventListener("keyup", (event) => { dajFilmove(1) });
    document.getElementById("datum").addEventListener("change", (event) => { dajFilmove(1) });
    document.getElementById("sortiraj").addEventListener("change", (event) => { dajFilmove(1) });
    document.getElementById("zanr").addEventListener("change", (event) => { dajFilmove(1) });
});

async function dajFilmove(str) 
{
    let datum = document.getElementById("datum").value;
    let sortiraj = document.getElementById("sortiraj").value;
    let zanr_id = document.getElementById("zanr").value;


    let parametri = { method: 'POST' }
    parametri = await dodajToken(parametri);
    let odgovor = await fetch("/filmoviPregled?stranica=" + str + "&filter=" + dajFilter()
        + "&datum=" + datum + "&sortiraj=" + sortiraj + "&zanr=" + zanr_id, parametri);
    if (odgovor.status == 200) 
    {
        let podaci = await odgovor.text();
        podaci = JSON.parse(podaci);
        
        let parametri = { method: 'POST' }
        parametri = await dodajToken(parametri);
        let odg = await fetch("/dajKonfiguraciju", parametri);
        let konf_string = await odg.text();
        let konf = JSON.parse(konf_string);
        let appBrojStranica = konf["app.broj.stranica"];

        let odobreniFilmovi = podaci.filmovi.filter(film => film.odobren == 1);
        let brojOdobrenih = odobreniFilmovi.length;

        console.log("odobreni " + JSON.stringify(odobreniFilmovi) + " " + brojOdobrenih); 

        let ukupno = Math.ceil(brojOdobrenih/appBrojStranica);
        if (ukupno == 0) ukupno = 1;

        prikaziStranicenje(str, ukupno, "dajFilmove");

        let pocniOdFilma = (str-1)*appBrojStranica;
        let ostatak = brojOdobrenih % appBrojStranica;
        let gornjaGranica = (appBrojStranica * str <= brojOdobrenih) ? appBrojStranica * str : appBrojStranica * (str-1) + ostatak;

        prikaziPopisFilmova(odobreniFilmovi,pocniOdFilma, gornjaGranica);
    } 
    else if (odgovor.status == 401) 
    {
        document.getElementById("sadrzaj").innerHTML="";
        poruka.innerHTML = "Neautorizirani pristup! Prijavite se!"
    } else 
    {
        poruka.innerHTML = "Greška u dohvatu filmova!"
    }
}

function prikaziPopisFilmova(filmovi, donjaGranica, gornjaGranica)
{
    let glavna = document.getElementById("sadrzaj");
    let prikaz = "<ul id='listaFilmova'>";
    for (let i = donjaGranica; i < gornjaGranica; i++)
    {
        //if (filmovi[i].odobren == 1)
        //{
            prikaz += "<li><a id='" + filmovi[i].tmdb_id + "' href='/filmInfo/"+filmovi[i].tmdb_id+"?film="+filmovi[i].naziv+"'>";
            prikaz += filmovi[i].naziv;
            prikaz += "</a></li>"
        //}    
    }
    prikaz += "</ul>";
    glavna.innerHTML = prikaz;

    sessionStorage.filmoviIzBaze = JSON.stringify(filmovi);

    /*let listaFilmova = document.getElementById("listaFilmova");
    console.log(listaFilmova);
    for (li of listaFilmova.children) 
    {
        let id = li.children[0].id;
        console.log(id);
        let nazivFilma = document.getElementById(id);
        console.log(nazivFilma);
        dodajSlusac(nazivFilma);
    }*/

}

function dajFilter() 
{
    return document.getElementById("filter").value;
}
/*
function dodajSlusac(element) {
    element.addEventListener("click", function (event) {
        event.preventDefault();
        skocni = "<dialog open id='dijaloski'><p id='tekstProzora'>";
        skocni += podaciZaFilm(element.id);
        skocni += "</p><button id='povratak'>Povratak</button></dialog>";
        let div = document.getElementById('skocni');
        div.innerHTML = skocni;
        skocni = document.getElementById("dijaloski");
        skocni.style = "position: fixed; z-index: 10";
        let tekst = document.getElementById("tekstProzora");
        povratakGumb = document.getElementById("povratak");
        povratakGumb.addEventListener("click", function () {
            setTimeout(()=>zatvori(div), 0);
        });
    })
}

function zatvori(div) {
    div.innerHTML = "";
}


function podaciZaFilm(id)
{
    let podaci = "";
    let filmovi = JSON.parse(sessionStorage.filmoviIzBaze);

    let film;
    for (f of filmovi)
    {
        if (f.tmdb_id == id)
        {
            film = f;
            break;
        }
    }
    podaci += "<ul>";
    podaci += "<img alt='poster_filma' src='https://image.tmdb.org/t/p/w600_and_h900_bestv2"+ film.putanja_postera + "'><br>";
    podaci += "<a href='/galerijaSlika/"+film.tmdb_id+"?film="+film.naziv+"'>Galerija slika</a>";
    for (f in film)
    {
        podaci += "<li>" + f + ": " + film[f] + "</li>";
    }
    podaci += "</ul>";
    console.log("PODACI " + podaci);
    return podaci;
}
*/