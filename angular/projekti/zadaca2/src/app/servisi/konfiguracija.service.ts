import { Injectable } from '@angular/core';
import { AutentifikacijaService } from './autentifikacija.service';

@Injectable({
  providedIn: 'root'
})
export class KonfiguracijaService {

  konf : any;
  appBrojStranica : number = 0;

  constructor(private authServis : AutentifikacijaService) 
  {
    this.dajAppBrojStranica();
  }

  async dajAppBrojStranica()
  {
    if (this.appBrojStranica == 0 || this.appBrojStranica == undefined || this.appBrojStranica == null)
    {
      await this.dohvatiKonfiguraciju();
      return this.appBrojStranica;
    }
    else 
      return this.appBrojStranica;
  }

  async dohvatiKonfiguraciju()
  {
    let parametri = { method: 'POST' }
    parametri = await this.authServis.dodajToken(parametri);
    let odg = await fetch("/dajKonfiguraciju", parametri);
    let konf_string = await odg.text();
    let konf = JSON.parse(konf_string);

    this.konf = konf;
    this.appBrojStranica = this.konf["app.broj.stranica"];

    return konf;
}
}
