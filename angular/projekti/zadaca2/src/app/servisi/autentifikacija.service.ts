import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { KorisnikI } from './KorisnikI';

@Injectable({
  providedIn: 'root'
})
export class AutentifikacijaService {

  urlPrijava = environment.appServis + "prijava";
  urlRegistracija = environment.appServis + "registracija";
  urlOdjava = environment.appServis + "odjava";
  urlToken = environment.appServis + "getJWT";
  urlKorisnikJWT = environment.appServis + "dajKorisnikaJWT";
  urlPrijavljeniKorisnikPodaci = environment.appServis + "dajPrijavljenogKorisnika";
  urlGenerirajJWT = environment.appServis + "generirajJWT";

  static prijavljeniKorisnik : KorisnikI | null = null;

  constructor() { }

  async prijavi(korime : string, lozinka : string)
  {
    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json"); 

    let token = await this.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'POST', body: JSON.stringify({"korime":korime,"lozinka":lozinka}), headers: zaglavlje };
            
    let o = (await fetch(this.urlPrijava, parametri)) as Response;
    let korisnik = JSON.parse(await o.text());

    AutentifikacijaService.prijavljeniKorisnik = korisnik;

    return korisnik;
  }

  async registriraj(korisnik : KorisnikI)
  {
    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    
    let token = await this.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'POST', body: JSON.stringify(
        {"korime": korisnik.korime,"lozinka": korisnik.lozinka, 
        "email": korisnik.email, "ime": korisnik.ime, "prezime":korisnik.prezime}
      ), headers: zaglavlje };
            
    let o = (await fetch(this.urlRegistracija, parametri)) as Response;
    let odgovor = JSON.parse(await o.text());

    return odgovor;
  }

  async odjavi()
  {
    AutentifikacijaService.prijavljeniKorisnik = null;
    await fetch(this.urlOdjava);
  }

  async dodajToken(parametri : any = {})
  {
    let zaglavlje = new Headers();
    
    if(parametri.headers != null)
      zaglavlje = parametri.headers;
      
    let token = await this.dajToken();
    zaglavlje.set("Authorization",token);
    parametri.headers = zaglavlje;
    return parametri;		
  }

  async dajToken()
  {
    let odgovor = await fetch(this.urlToken);
    let tekst = JSON.parse(await odgovor.text());
    if (tekst.ok != null)
      return tekst.ok;
    else 
      return "0000";
  }

  async dajKorisnikaJWT()
  {
    let odgovor = await fetch(this.urlKorisnikJWT);
    let tekst = JSON.parse(await odgovor.text());
    if (tekst.korisnik != null)
      return tekst.korisnik;
    else 
      return "Nema korisnika";
  }

  async dajPrijavljenogKorisnika()
  {
    let parametri = { method: 'POST' }
    parametri = await this.dodajToken(parametri);
    let odgovor = (await fetch(this.urlPrijavljeniKorisnikPodaci, parametri)) as Response;
    let podaci = JSON.parse(await odgovor.text());
    if (odgovor.status == 200)
      return podaci;
    else 
      return null;
  }

  async provjeriAutorizaciju()
  {
    let prijavljen = await this.dajPrijavljenogKorisnika();
    console.log("Korisnik: " + JSON.stringify(prijavljen));
    if (prijavljen == null)
    {
      return false;
    }
    else
      return true;
  }

  async provjeriAdmin()
  {
    let prijavljen : KorisnikI = await this.dajPrijavljenogKorisnika();

    if (prijavljen == null) return false;

    if (prijavljen.tip_korisnika_id == 1)
    {
      return true;
    }
    else
      return false;
  }

  async generirajJWT()
  {
    let odgovor = (await fetch(this.urlGenerirajJWT)) as Response;
    let podaci = JSON.parse(await odgovor.text());
    if (odgovor.status == 200)
      return podaci.token;
    else 
      return null;
  }

}
