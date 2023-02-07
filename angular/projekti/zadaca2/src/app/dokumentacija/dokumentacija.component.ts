import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dokumentacija',
  templateUrl: './dokumentacija.component.html',
  styleUrls: ['./dokumentacija.component.scss']
})
export class DokumentacijaComponent {

  url : string = environment.appServis;
  stranica : string = "";

  constructor()
  {
    this.ucitajHtmlDokumentaciju();
  }

  async ucitajHtmlDokumentaciju()
  {
    let urlDokumentacija = this.url + "app/dokumentacija";
    let odgovor = (await fetch(urlDokumentacija)) as Response;
    let stranica = await odgovor.text();

    let stranicaKomponenta = this.ukloniBody(stranica);
    stranicaKomponenta = this.ukloniHeader(stranicaKomponenta);
    stranicaKomponenta = this.ukloniFooter(stranicaKomponenta);

    console.log(stranicaKomponenta);
    this.stranica = stranicaKomponenta;
    
  }

  ukloniBody(stranica : string)
  {
    let stranicaKomponenta = stranica.split("body")[1];
    stranicaKomponenta = stranicaKomponenta.substring(1,stranicaKomponenta.length-2);
    return stranicaKomponenta;
  }

  ukloniHeader(stranica : string)
  {
    return stranica.split("</header>")[1];
  }

  ukloniFooter(stranica : string)
  {
    return stranica.split("<hr>")[0];
  }
}
