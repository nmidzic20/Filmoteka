import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AutentifikacijaService } from './autentifikacija.service';
import { KorisnikI } from './KorisnikI';

@Injectable({
  providedIn: 'root'
})
export class KorisniciService {

  url = environment.appServis;
  urlRest = environment.restServis;

  constructor(private authServis: AutentifikacijaService) { }

  async azuriraj(azuriraniKorisnik : KorisnikI)
  {
    if (!await this.authServis.provjeriAutorizaciju())
      return {"status": 401, "poruka": "Neautorizirani pristup!"};

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");

    let token = await this.authServis.generirajJWT();
    zaglavlje.set("Authorization",token);

    let parametri = { method: 'POST', body: JSON.stringify(azuriraniKorisnik), headers: zaglavlje };
    parametri = await this.authServis.dodajToken(parametri);

    let odgovor = await fetch(this.url + "azurirajKorisnika", parametri);
    let podaci = await odgovor.text();

    let poruka = "";

    if (odgovor.status == 200) 
    {
      poruka = "Korisnički podaci ažurirani!";
    } 
    else 
    {
      poruka = JSON.parse(podaci).greska;
    }
            
    return poruka;
  }
}
