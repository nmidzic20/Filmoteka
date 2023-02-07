let poruka;

window.addEventListener("load", async () => {

    let spanZanr = document.getElementById("spanZanr");
    let spanZanrSadrzaj = "<select id='zanr'>";
    let odg = await fetch("/dajSveZanrove");
    let zanrovi = await odg.text();
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
    let odgovor = await fetch("/filmoviPrijedlozi?stranica=" + str + "&filter=" + dajFilter()
        + "&datum=" + datum + "&sortiraj=" + sortiraj + "&zanr=" + zanr_id, parametri);
    let podaci = await odgovor.text();
    podaci = JSON.parse(podaci);
    console.log("podaci " + JSON.stringify(podaci));

    if (odgovor.status == 200) 
    {
        console.log(JSON.stringify(podaci.ukupno));
        
        let parametri = { method: 'POST' }
        parametri = await dodajToken(parametri);
        let odg = await fetch("/dajKonfiguraciju", parametri);
        let konf_string = await odg.text();
        let konf = JSON.parse(konf_string);
        let appBrojStranica = parseInt(konf["app.broj.stranica"]);
            
        let neodobreniFilmovi = podaci.filmovi.filter(film => film.odobren == 0);
        let brojNeodobrenih = neodobreniFilmovi.length;

        console.log("neodobreni " + JSON.stringify(neodobreniFilmovi) + " " + brojNeodobrenih); 

        let ukupno = Math.ceil(brojNeodobrenih/appBrojStranica);
        if (ukupno == 0) ukupno = 1;

        prikaziStranicenje(str, ukupno, "dajFilmove");

        let pocniOdFilma = (str-1)*appBrojStranica;
        let ostatak = brojNeodobrenih % appBrojStranica;
        let gornjaGranica = (appBrojStranica * str <= brojNeodobrenih) ? appBrojStranica * str : appBrojStranica * (str-1) + ostatak;

        prikaziPopisFilmova(neodobreniFilmovi,pocniOdFilma, gornjaGranica);

    } 
    else 
    {
        poruka.innerHTML = podaci.greska;
    }
}

function prikaziPopisFilmova(filmovi, donjaGranica, gornjaGranica)
{
    console.log("DG I GG: " + donjaGranica + gornjaGranica);

    let glavna = document.getElementById("sadrzaj");
    let prikaz = "<ul id='listaFilmova'>";
    for (let i = donjaGranica; i < gornjaGranica; i++)
    {
        //if (filmovi[i].odobren == 0)
        //{
            prikaz += "<li><a id='" + filmovi[i].tmdb_id + "' href=''>";
            prikaz += filmovi[i].naziv;
            prikaz += "</a>";
            prikaz += "<button onClick='odobri(" + filmovi[i].tmdb_id + ")'>Odobri</button>";
            prikaz += "<button onClick='obrisi(" + filmovi[i].tmdb_id + ")'>Obriši iz baze</button>";
            prikaz += "</li>";
        //}
        
    }
    prikaz += "</ul>";
    glavna.innerHTML = prikaz;

    sessionStorage.filmoviIzBaze = JSON.stringify(filmovi);

    let listaFilmova = document.getElementById("listaFilmova");
    console.log(listaFilmova);
    for (li of listaFilmova.children) 
    {
        let id = li.children[0].id;
        console.log(id);
        let nazivFilma = document.getElementById(id);
        console.log(nazivFilma);
        dodajSlusac(nazivFilma);
    }

}

function dajFilter() 
{
    return document.getElementById("filter").value;
}

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
    for (f in film)
    {
        podaci += "<li>" + f + ": " + film[f] + "</li>";
    }
    podaci += "</ul>";
    return podaci;
}


async function odobri(idFilma) 
{
    let filmovi = JSON.parse(sessionStorage.filmoviIzBaze);
    for (let film of filmovi) 
    {
        if (idFilma == film.tmdb_id) 
        {  
            let parametri = { method: 'PUT', body: JSON.stringify(film) };
            parametri = await dodajToken(parametri);
            parametri.headers.set("Content-Type", "application/json"); 

            let odgovor = await fetch("/odobriFilm", parametri);
            let podaci = await odgovor.text();

            if (odgovor.status == 200) 
            {
                poruka.innerHTML = "Film " + idFilma + " odobren!";
            } 
            else 
            {
                poruka.innerHTML = JSON.parse(podaci).greska;
            }

            await preuzmiPoster(film);

            break;
        }
    }
    dajFilmove(1); 
}


async function obrisi(idFilma) 
{
    let filmovi = JSON.parse(sessionStorage.filmoviIzBaze);
    for (let film of filmovi) 
    {
        if (idFilma == film.tmdb_id) 
        {  
            let parametri = { method: 'DELETE', body: JSON.stringify(film) };
            parametri = await dodajToken(parametri);
            parametri.headers.set("Content-Type", "application/json"); 

            let odgovor = await fetch("/obrisiFilm", parametri);
            let podaci = await odgovor.text();

            if (odgovor.status == 200) 
            {
                poruka.innerHTML = "Film " + idFilma + " obrisan iz baze!";
            } 
            else 
            {
                poruka.innerHTML = JSON.parse(podaci).greska;
            }
            break;
        }
    }
    dajFilmove(1);
}


async function preuzmiPoster(film)
{
    let parametri = { method: 'POST', body: JSON.stringify(film)};
    parametri = await dodajToken(parametri);            
    parametri.headers.set("Content-Type", "application/json"); 
    let odgovor = await fetch("/preuzmiPoster", parametri);
    let podaci = await odgovor.text();

    if (odgovor.status == 200) 
    {
        poruka.innerHTML += "<br>Preuzet poster za film!";
    } 
    else 
    {
        poruka.innerHTML = JSON.parse(podaci).greska;
    }
}