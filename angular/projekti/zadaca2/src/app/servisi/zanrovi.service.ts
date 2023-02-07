import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AutentifikacijaService } from './autentifikacija.service';
import { ZanrI } from './ZanrI';

@Injectable({
  providedIn: 'root'
})
export class ZanroviService {
  
  url : string = environment.appServis;
  urlRest : string = environment.restServis;
  zanrovi = new Array<ZanrI>();

  constructor(private authServis : AutentifikacijaService) 
  {}

  async dajZanrove()
  {
    await this.dohvatiZanrove();
    return this.zanrovi;
  }

  async dohvatiZanrove()
  {
    let zaglavlje = new Headers();
    zaglavlje.set("Accept", "application/json");
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let urlZanrovi = this.urlRest + "api/zanr"; //this.url + "dajSveZanrove";
    let odgovor = (await fetch(urlZanrovi, { method: 'GET', headers: zaglavlje})) as Response;
    let podaci = await odgovor.text();
    let zanrovi = JSON.parse(podaci) as Array<ZanrI>;
    this.zanrovi = zanrovi;
    return this.zanrovi;
  }

  async dohvatiZanroveTMDB()
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let parametri = { method: 'GET', headers: zaglavlje }
    //parametri = await this.authServis.dodajToken(parametri);
    let odgovor = await fetch(this.urlRest + "api/tmdb/zanr", parametri);
    let podaci = await odgovor.text();
    return JSON.parse(podaci);
  }

  async obrisiSveZanroveBezFilmova()
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let params = { method: 'DELETE', headers: zaglavlje }
    //params = await this.authServis.dodajToken(params);
    let odg = await fetch(this.urlRest + "api/zanr", params);
    await odg.text();
    return;
  }

  async dajSveZanroveAdmin()
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let params = { method: 'GET', headers: zaglavlje }
    //params = await this.authServis.dodajToken(params);
    let odg = await fetch(this.urlRest + "api/zanr", params);

    let greska = "";
    let podaci : any = await odg.text();
    podaci = JSON.parse(podaci);

    if (odg.status != 200) 
    {
      greska = podaci.greska;
    }
    
    return {"greska":greska, "podaci":podaci};

  }

  async azurirajZanr(zanr : ZanrI, noviNazivZanra : string)
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let azuriraniZanr : ZanrI = {};
    azuriraniZanr.z_naziv = noviNazivZanra;
    azuriraniZanr.z_tmdb_id = zanr.z_tmdb_id;
    azuriraniZanr.originalni_naziv = zanr.originalni_naziv;

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let parametri = { method: 'PUT', body: JSON.stringify(azuriraniZanr), headers: zaglavlje };
    //parametri = await this.authServis.dodajToken(parametri);

    let odgovor = await fetch(this.urlRest + "api/zanr/" + zanr.z_tmdb_id, parametri);
    let podaci = await odgovor.text();

    let poruka = "";

    if (odgovor.status == 200) 
    {
      poruka = "Žanr " + zanr.z_tmdb_id + " ažuriran!";
    } 
    else 
    {
      poruka = JSON.parse(podaci).greska;
    }
            
    return poruka;
  }

  async obrisiZanr(zanr : ZanrI)
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let parametri = { method: 'DELETE', body: JSON.stringify(zanr), headers: zaglavlje };
    //parametri = await this.authServis.dodajToken(parametri);

    let odgovor = await fetch(this.urlRest + "api/zanr/" + zanr.z_tmdb_id, parametri);
    let podaci = await odgovor.text();

    return podaci;
  }

  async dodajZanr(zanr : any)
  {
    if (!await this.authServis.provjeriAdmin())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    zaglavlje.set("Authorization", await this.authServis.generirajJWT());

    let parametri = { method: 'POST', body: JSON.stringify(zanr), headers: zaglavlje };
    //parametri = await this.authServis.dodajToken(parametri);

    let odgovor = await fetch(this.urlRest + "api/zanr", parametri);
    let podaci = await odgovor.text();
  
    return podaci;
  }

  
}
