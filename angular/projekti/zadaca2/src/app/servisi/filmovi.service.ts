import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AutentifikacijaService } from './autentifikacija.service';
import { FilmI } from './FilmI';
import { FilmPretrazivanjeTMDB_I } from './FilmPretrazivanjeTMDB_I';
import { KonfiguracijaService } from './konfiguracija.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FilmoviService {

  url : string = environment.appServis;
  urlRest : string = environment.restServis;
  appBrojStranica! : number

  filmovi = new Array<FilmI>();

  constructor(
    private authServis : AutentifikacijaService, 
    private konfServis : KonfiguracijaService,
    private router : Router
  ) 
  {
    this.dohvatiAppBrojStranica();
  }

  async dohvatiAppBrojStranica()
  {
    this.appBrojStranica = await this.konfServis.dajAppBrojStranica();
  }

  async dodajUBazu(film : FilmPretrazivanjeTMDB_I)
  {
    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    let parametri = { method: 'POST', body: JSON.stringify(film), headers: zaglavlje };
    parametri = await this.authServis.dodajToken(parametri);

    let odgovor = await fetch(this.url + "dodajFilm", parametri);

    let poruka = "";
    let podaci;

    if (odgovor.status == 200) 
    {
      let podaciString = await odgovor.text();
      podaci = JSON.parse(podaciString);
      poruka = "Film " + film.title + " dodan u bazu!";
    } 
    else 
    {
      podaci = await odgovor.text();
      poruka = JSON.parse(podaci).greska;
    }

    return {"status": odgovor.status, "poruka": poruka, "film": podaci};
    
  }

  async dajFilmoveTMDB(params : any)
  {
    if (!await this.authServis.provjeriAutorizaciju())
      return {"status": 401, "poruka": "Neautorizirani pristup! Prijavite se!", "filmovi": undefined};

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");

    let token = await this.authServis.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'GET', headers: zaglavlje};
      
    //let parametri = { method: 'POST' }
    //parametri = await this.authServis.dodajToken(parametri);
    //let odgovor = await fetch(this.url + "filmoviPretrazivanje?str=" + params.str + "&filter=" + params.filter, parametri);

    let urlPretrazivanje = "api/tmdb/filmovi?stranica=" + params.str + "&kljucnaRijec=" + params.filter;
    let odgovor = await fetch(this.urlRest + urlPretrazivanje, parametri)

    let poruka = "";
    let podaci;
    if (odgovor.status == 200) 
    {
      let podaciString = await odgovor.text();
      podaci = JSON.parse(podaciString);
    }
    else if (odgovor.status == 401) 
    {
      poruka = "Neautorizirani pristup! Prijavite se!"
    }
    else
    {
      poruka = "Greška u dohvatu filmova!"
    }
    return {"status": odgovor.status, "poruka": poruka, "filmovi": podaci};
  }

  async dajFilmove(params : any)
  {
    console.log("daj Filmove pozvana, putanja je " + this.router.url);

    if (this.router.url != "/pocetna" && !await this.authServis.provjeriAutorizaciju())
      return {"status": 401, "poruka": "Neautorizirani pristup! Prijavite se!", "filmovi": undefined};

    //let parametri = { method: 'POST' }
    //parametri = await this.authServis.dodajToken(parametri);
    //let urlPregled = this.url +"filmoviPregled?stranica=" + params.stranica + "&filter=" + params.filter
      //+ "&datum=" + params.datum + "&sortiraj=" + params.sortiraj + "&zanr=" + params.zanr;

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");

    let token = await this.authServis.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'GET', headers: zaglavlje};

    let urlPregled = this.urlRest + "api/filmovi?stranica=" + params.stranica + "&brojFilmova=" + 
      this.appBrojStranica + "&datum=" + params.datum + "&zanr=" + params.zanr + "&naziv=" + params.filter
      + "&sortiraj=" + params.sortiraj;
    let odgovor = await fetch(urlPregled, parametri);

    let poruka = "";
    let podaci;
    if (odgovor.status == 200) 
    {
      let podaciString = await odgovor.text();
      podaci = JSON.parse(podaciString);
    }
    else if (odgovor.status == 401) 
    {
      poruka = "Neautorizirani pristup! Prijavite se!"
    }
    else
    {
      poruka = "Greška u dohvatu filmova!"
    }
    return {"status": odgovor.status, "poruka": poruka, "filmovi": podaci};
  }

  async dajFilmovePoZanru(zanr_id : number)
  {
    await this.dohvatiFilmovePoZanru(zanr_id);
    return this.filmovi;
  }

  async dohvatiFilmovePoZanru(zanr_id : number)
  {
    let odgovor = await fetch(this.url + "dajDvaFilma?zanr=" + zanr_id);
    let podaci = await odgovor.text();
    let filmovi = JSON.parse(podaci);
    this.filmovi = filmovi;
    return this.filmovi;
  }

  async obrisiFilmIzBaze(film : FilmI)
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");

    let token = await this.authServis.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'DELETE', body: JSON.stringify(film), headers: zaglavlje };
    parametri = await this.authServis.dodajToken(parametri);

    //let odgovor = await fetch(this.url + "obrisiFilm", parametri);
    let odgovor = await fetch(this.urlRest + "api/filmovi/" + film.tmdb_id, parametri)
    let podaci = await odgovor.text();

    return podaci;
  }

  async odobriFilm(film : FilmI)
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");

    let token = await this.authServis.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'PUT', body: JSON.stringify(film), headers: zaglavlje };
    parametri = await this.authServis.dodajToken(parametri);

    //let odgovor = await fetch(this.url + "odobriFilm", parametri);
    let odgovor = await fetch(this.urlRest + "api/filmovi/" + film.tmdb_id, parametri)
    let podaci = await odgovor.text();

    return podaci;
  }

  async preuzmiPosterFilma(film : FilmI)
  {
    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");

    let token = await this.authServis.generirajJWT();
    zaglavlje.set("Authorization",token);
    let parametri = { method: 'GET', headers: zaglavlje};

    let urlPoster = this.urlRest + "api/tmdb/filmovi?id=" + film.tmdb_id + "&poster_path=" + film.putanja_postera;

    //let parametri = { method: 'POST', body: JSON.stringify(film), headers: zaglavlje}; za appServer
    //parametri = await this.authServis.dodajToken(parametri);            
    //let odgovor = await fetch(this.url + "preuzmiPoster", parametri);
    let odgovor = await fetch(urlPoster, parametri);
    let podaci = await odgovor.text();

    return podaci;
  }

  async dajFilm(id : number)
  {
    if (!await this.authServis.provjeriAutorizaciju())
      return {"status": 401, "poruka": "Neautorizirani pristup! Prijavite se!", "film": undefined};

    let token = await this.authServis.generirajJWT();
    console.log("TOKEN " + token);

    let zaglavlje = new Headers();
    zaglavlje.set("Authorization",token);
    let parametri = { method: 'GET', headers: zaglavlje }
    
    let url = this.urlRest + "api/filmovi/" + id;
    let odgovor = await fetch(url, parametri);

    let poruka = "";
    let podaci;
    if (odgovor.status == 200) 
    {
      let podaciString = await odgovor.text();
      podaci = JSON.parse(podaciString) as FilmI;
    }
    else if (odgovor.status == 401) 
    {
      poruka = "Neautorizirani pristup! Prijavite se!"
    }
    else
    {
      poruka = "Greška u dohvatu filmova!"
    }
    return {"status": odgovor.status, "poruka": poruka, "film": podaci};
  }


}
