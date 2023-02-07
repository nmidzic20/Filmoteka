import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AutentifikacijaService } from './autentifikacija.service';

@Injectable({
  providedIn: 'root'
})
export class SlikeService {

  url : string = environment.appServis;

  constructor(private authServis : AutentifikacijaService) { }

  async dajURLSlikaZaFilm(filmId : number, datumOd : Date | null, datumDo : Date | null)
  {
    let urloviSlika;

    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    zaglavlje.set("Accept", "application/json");
    let parametri = { method: 'POST', headers: zaglavlje };
    parametri = await this.authServis.dodajToken(parametri);
    
    let putanja = this.url + "galerijaSlikaURL/" + filmId + "?od=" + datumOd + "&do=" + datumDo;
    let odgovor = (await fetch(putanja, parametri)) as Response;
    urloviSlika = await odgovor.text();

    return urloviSlika;
  }
}
