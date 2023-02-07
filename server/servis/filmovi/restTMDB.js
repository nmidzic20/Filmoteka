const TMDBklijent = require("./klijentTMDB.js");

class RestTMDB {

    constructor(api_kljuc) 
    {
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
        
        //this.tmdbKlijent.dohvatiFilm(500).then(console.log).catch(console.log);
    }

    getZanr(zahtjev, odgovor) 
    {
        this.tmdbKlijent.dohvatiZanrove().then((zanrovi) => {
            odgovor.type("application/json")
            odgovor.send(zanrovi);
        }).catch((greska) => {
            odgovor.json(greska);
        });
    }

    getFilmovi(zahtjev, odgovor) 
    {
        odgovor.type("application/json");

        let id = zahtjev.query.id;
        let stranica = zahtjev.query.stranica;
        let rijeci = zahtjev.query.kljucnaRijec;

        let poster_path = zahtjev.query.poster_path;

        if (poster_path != null && id != null)
        {
            console.log("POSTER");
            this.tmdbKlijent.dohvatiPoster(id, poster_path).then((poruka) => {
                odgovor.send(poruka);
            }).catch((greska) => {
                odgovor.json(greska);
            });
        }
        else if (id != null)
        {
            this.tmdbKlijent.dohvatiFilm(id).then((film) => {
                console.log("getfilm : " + film);
                odgovor.send(film);
            }).catch((greska) => {
                odgovor.json(greska);
            });
        }
        else if (stranica == null || rijeci == null)
        {
            odgovor.status(417);
            odgovor.send({greska: "Neočekivani podaci"});
            return;
        } 
        else 
        {
            this.tmdbKlijent.pretraziFilmove(rijeci,stranica).then((filmovi) => {
                odgovor.send(filmovi);
            }).catch((greska) => {
                odgovor.json(greska);
            });
        }

    }

    getFilm(id) 
    {
        odgovor.type("application/json");
        console.log("ID je " + id);

        this.tmdbKlijent.dohvatiFilm(id).then((film) => {
            console.log("getfilm : " + film);
            return film;
        }).catch((greska) => {
            return greska;
        });
    }

    vratiMetodaNijeImplementirana(zahtjev,odgovor)
    {
        odgovor.type("application/json")
        odgovor.status(501);
        let poruka = { greska: "metoda nije implementirana" }
        odgovor.send(JSON.stringify(poruka));
    }
}

module.exports = RestTMDB;