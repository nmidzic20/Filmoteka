import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SlikeService } from '../../servisi/slike.service';
import { slikaInfo } from '../slikaInfo';
import {FormGroup, FormControl} from '@angular/forms';
import { KorisnikI } from '../../servisi/KorisnikI';
import { SharedServiceService } from '../../servisi/shared-service.service';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-galerija-slika',
  templateUrl: './galerija-slika.component.html',
  styleUrls: ['./galerija-slika.component.scss']
})
export class GalerijaSlikaComponent {

  filmId: number | null = null;
  filmNaziv : string = "";
  urloviSlike : Array<string> = new Array<string>();

  slikeInfo : Map<string,slikaInfo> = new Map<string,slikaInfo>();

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  dateStart : Date | null = null;
  dateEnd : Date | null = null;

  poruka : string = "";
  vidljivo = true;
  korisnik! : KorisnikI;

  constructor(
    public dialog: MatDialog,
    public route:ActivatedRoute, 
    private slikeServis: SlikeService,
    private _sharedService: SharedServiceService,
    private authServis: AutentifikacijaService)
  {
    this.filmId = parseInt(this.route.snapshot.paramMap.get("id")!);
    this.filmNaziv = this.route.snapshot.queryParamMap.get("film")!;

    this.provjeriKorisnickePodatke();
    this.dajURLoveSlika();
  }

  dajPocetniDatum()
  {
    this.dateStart = this.dateRange.value.start;
    console.log(this.dateStart + " " + this.dateEnd);
    this.dajURLoveSlika();

  }

  dajZavrsniDatum()
  {
    this.dateEnd = this.dateRange.value.end;
    console.log(this.dateStart + " " + this.dateEnd);
    this.dajURLoveSlika();

  }

  async dajURLoveSlika()
  {
    let odgovor = (await this.slikeServis.dajURLSlikaZaFilm(this.filmId!, this.dateStart, this.dateEnd));
    console.log(odgovor);

    if ((JSON.parse(odgovor)).slikePutanjePoDatumu != null)
    {
      this.urloviSlike = (JSON.parse(odgovor)).slikePutanjePoDatumu;
      this.popuniSlikaInfo();
    }
    else if (this.korisnik.tip_korisnika_id != undefined) 
    {
      this.poruka = "Nijedan korisnik još nije dodao slike za ovaj film";
      this.otvoriProzorPoruke();
    }
  }

  popuniSlikaInfo()
  {
    this.urloviSlike.forEach( (u) =>
    {
      this.slikeInfo.set(u, {
        nazivSlike: "",
        nazivFilma: this.filmNaziv,
        url: u,
        idFilma: this.filmId!,
        dodao_korisnik: u.split("/")[3]
      });
    }); 

  }

  async provjeriKorisnickePodatke()
  {
    let prijavljeniKorisnik = await this.authServis.dajKorisnikaJWT();
    console.log(prijavljeniKorisnik + " " + prijavljeniKorisnik.korime + " " + prijavljeniKorisnik.uloga);

    this.korisnik = {
      korime: prijavljeniKorisnik.korime,
      tip_korisnika_id: prijavljeniKorisnik.uloga
    }

    if (this.korisnik.tip_korisnika_id == undefined)
    {
      this.vidljivo = false;
      this.poruka = "Neautoriziran pristup! Prijavite se";
      this.otvoriProzorPoruke();
    }
    else
    {
      this.vidljivo = true;
      this._sharedService.emitChange({"korisnik": this.korisnik, poruka: "Galerija"});
    }

  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }


}
