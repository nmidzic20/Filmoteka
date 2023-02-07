const FilmDAO = require("./filmDAO.js");

exports.getFilmovi = function (zahtjev, odgovor) 
{
    odgovor.type("application/json");

    let params = {};
    params.stranica = zahtjev.query.stranica;
    params.brojFilmova = zahtjev.query.brojFilmova;
    params.datum = zahtjev.query.datum;
    params.zanr_id = zahtjev.query.zanr;
    params.naziv = zahtjev.query.naziv;
    params.sortiraj = zahtjev.query.sortiraj;


    if (params.stranica == null || params.brojFilmova == null)
    {
        odgovor.status = 400;
        odgovor.send(JSON.stringify({greska: "Nevaljan zahtjev!"}));
    }
    else
    {
        let fdao = new FilmDAO();
        fdao.dajPretrazivanje(params).then(async (rezultat) => {

            let podaci = {};
            podaci.filmovi = [];

            let tmdbIdovi = [];
            for (f of rezultat.filmovi)
                tmdbIdovi.push(f.tmdb_id); 
            let set = new Set(tmdbIdovi); 

            let jedinstveniTmdbIdovi = Array.from(set);

            for (tmdbId of jedinstveniTmdbIdovi)
                for (f of rezultat.filmovi)
                {
                    if (f.tmdb_id == tmdbId)
                    {
                        podaci.filmovi.push(f);
                        break;
                    }                        
                }
            
            podaci.ukupno = set.size;

            //console.log("REST FILMOVI PRIJE LIMIT OFFSET :" + JSON.stringify(podaci));

            odgovor.send(JSON.stringify(podaci));
            
        });

    }
}

exports.postFilmovi = async function (zahtjev, odgovor) 
{

    odgovor.type("application/json");
    let film = zahtjev.body; 

    let token = zahtjev.get("Authorization");
    let zaglavlje = new Headers();
    zaglavlje.set("Authorization",token);
    let parametri = { method: 'GET', headers: zaglavlje };

    //let putanja = "http://spider.foi.hr:12271/api/tmdb/filmovi?id="+film.id;
    let putanja = "http://localhost:4300/api/tmdb/filmovi?id="+film.id;
 
    let odg = await fetch(putanja, parametri);
    let film_tmdb_string = await odg.text();

    let film_tmdb = JSON.parse(film_tmdb_string);
    film_tmdb["korisnik_dodao"] = film.korisnik_dodao;

    let nijeUBazi = false;
    let fdao = new FilmDAO();

    await fdao.daj(film_tmdb.id).then((vraceni_film) => {
        if (vraceni_film != null)
        {
            odgovor.status(400);
            odgovor.send(JSON.stringify({greska: "Za ovaj film već postoji prijedlog!"}));
            return;
        }
        else
            nijeUBazi = true;
    });

    
    if (nijeUBazi)
    {
        console.log("Film dodavanje " + JSON.stringify(film_tmdb));

        let fdao2 = new FilmDAO();
        await fdao2.dodaj(film_tmdb).then((poruka) => {
            odgovor.send(JSON.stringify(poruka));
        });

        console.log("Film uspjesno dodan ");

        let dodanoZanrovi = [];
        for (zanr in film_tmdb.genres)
        {
            let fdao3 = new FilmDAO();
            dodanoZanrovi.push(fdao3.dodajPoZanru(film_tmdb.id,film_tmdb.genres[zanr].id));
        }

        await Promise.all(dodanoZanrovi); 
        
    }
    
}

exports.putFilmovi = function (zahtjev, odgovor) 
{
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}

exports.deleteFilmovi = function (zahtjev, odgovor) 
{
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}



exports.getFilm = function (zahtjev, odgovor) 
{
    odgovor.type("application/json")
    let fdao = new FilmDAO();
    let id = zahtjev.params.id;
    fdao.daj(id).then((film) => {
        console.log(film);

        let fdao2 = new FilmDAO();
        fdao2.dajZanroveZaFilm(id).then((zanrovi) =>
        {
            let imenaZanrova = [];
            console.log(zanrovi);
            for (zanr of zanrovi) 
            {
                console.log(zanr);
                imenaZanrova.push(zanr.z_naziv);
            }
            film["zanrovi"] = imenaZanrova;
            console.log("restfilm zanrovi za film " + JSON.stringify(film["zanrovi"]));
            odgovor.send(JSON.stringify(film));
        });
    });
}

exports.postFilm = function (zahtjev, odgovor) 
{
    odgovor.type("application/json")
    odgovor.status(405);
    let poruka = { greska: "metoda nije dopuštena" }
    odgovor.send(JSON.stringify(poruka));
}

exports.putFilm = async function (zahtjev, odgovor) 
{
    odgovor.type("application/json")
    let id = zahtjev.params.id;
    let podaci = zahtjev.body;
    let fdao = new FilmDAO();

    await fdao.daj(id).then((film) => {
        
        if (film.odobren != 1)
        {
            let fdao2 = new FilmDAO();
            fdao2.odobri(id).then((poruka) => {
                odgovor.send(JSON.stringify(poruka));
            });
        }
        else
        {
            let fdao2 = new FilmDAO();
            fdao2.azuriraj(id, podaci).then((poruka) => {
                odgovor.send(JSON.stringify(poruka));
            });
        }
    });

}

exports.deleteFilm = function (zahtjev, odgovor) 
{
    odgovor.type("application/json");
    let id = zahtjev.params.id;

    let fdao = new FilmDAO();

    fdao.obrisi(id).then((poruka) => {
        odgovor.send(JSON.stringify(poruka));
    });
}

