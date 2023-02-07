import { Component, ViewChild } from '@angular/core';
import { FilmI } from '../../servisi/FilmI';
import { FilmoviService } from '../../servisi/filmovi.service';
import { GumbI } from '../../servisi/GumbI';
import { KonfiguracijaService } from '../../servisi/konfiguracija.service';
import { ZanrI } from '../../servisi/ZanrI';
import { ZanroviService } from '../../servisi/zanrovi.service';
import { StranicenjeComponent } from '../../stranicenje/stranicenje.component';
import { MatDialog } from '@angular/material/dialog';
import { FilmInfoComponent } from '../film-info/film-info.component';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { SharedServiceService } from '../../servisi/shared-service.service';

@Component({
  selector: 'app-prijedlozi-filmovi',
  templateUrl: './prijedlozi-filmovi.component.html',
  styleUrls: ['./prijedlozi-filmovi.component.scss']
})
export class PrijedloziFilmoviComponent {

  poruka : string = "";
  zanrovi? : Array<ZanrI>;
  odabraniZanr? : ZanrI;
  selectSortOpcije : Array<string> = ["Datumu", "Nazivu", "Žanru"];
  sortOdabranaOpcija : string = this.selectSortOpcije[0];
  sortOdabranaOpcijaKratica : string = "d";
  odabraniDatum? : string;
  kljucneRijeciFiltar? : string;
  status : number = 200;

  filmovi : Array<FilmI> = new Array<FilmI>();
  filmoviZaPrikaz : Array<FilmI> = new Array<FilmI>();

  oznaceniFilm : FilmI | undefined;

  @ViewChild('stranicenjeFilmoviPrijedlozi') stranicenjeFilmoviPrijedlozi! : StranicenjeComponent;

  constructor(
    public dialog : MatDialog,
    private zanroviServis : ZanroviService, 
    private filmoviServis : FilmoviService,
    private konfServis : KonfiguracijaService,
    private authServis : AutentifikacijaService,
    private _sharedService : SharedServiceService)
  {
    this.provjeriKorisnika();
  }

  async provjeriKorisnika()
  {
    let admin = await this.authServis.provjeriAdmin();
    let prijavljen = await this.authServis.provjeriAutorizaciju();

    if (!admin && prijavljen)
    {
      this.status = 403;
      this.poruka = "Neautorizirani pristup! Niste administrator!"
      this.otvoriProzorPoruke();

      let prijavljeniKorisnik = await this.authServis.dajKorisnikaJWT();
      console.log(prijavljeniKorisnik + " " + prijavljeniKorisnik.korime + " " + prijavljeniKorisnik.uloga);

      let korisnik = {
        korime: prijavljeniKorisnik.korime,
        tip_korisnika_id: prijavljeniKorisnik.uloga
      }
      this._sharedService.emitChange({"korisnik": korisnik, poruka: "Prijedlozi_obican"});
    }
    else if (admin)
    {
      this.prikaziZanrove();
      this.dajFilmove(1);
    }
    else
    {
      this.status = 401;
      this.poruka = "Neautorizirani pristup! Prijavite se!"
      this.otvoriProzorPoruke();
    }
    
  }

  async prikaziZanrove()
  {
    this.zanrovi = await this.zanroviServis.dajZanrove();
  }

  dajSortOdabranuOpciju(odabranaOpcija : any)
  {
    console.log(odabranaOpcija);
    let val : string;
    switch(odabranaOpcija)
    {
      case "Datumu": val = 'd'; break;
      case "Žanru": val = 'z'; break;
      case "Nazivu": val = 'n'; break;
    }
    this.sortOdabranaOpcija = odabranaOpcija;
    this.sortOdabranaOpcijaKratica = val!;
    console.log("val " + val! + " " + this.sortOdabranaOpcija + " " + this.sortOdabranaOpcijaKratica);
    this.dajFilmove(1);
  }

  dajOdabraniZanr(odabraniZanr : ZanrI)
  {
    console.log(odabraniZanr.z_naziv);
    this.odabraniZanr = odabraniZanr;
    console.log(this.odabraniZanr.z_tmdb_id);
    this.dajFilmove(1);
  }

  dajOdabraniDatum(odabraniDatum : any)
  {
    this.odabraniDatum = (odabraniDatum as string).split(" GMT")[0];
    console.log(this.odabraniDatum);
    this.dajFilmove(1);
  }

  dajRijeciFiltra(kljucneRijeci : any)
  {
    console.log(kljucneRijeci);
    this.kljucneRijeciFiltar = kljucneRijeci;
    this.dajFilmove(1);

  }
  
  async dajFilmove(str : number) 
  {
    console.log("zanr id je " + this.odabraniZanr?.z_tmdb_id);
    
    let parametri = {
      "stranica": str,
      "filter": this.kljucneRijeciFiltar,
      "datum": this.odabraniDatum,
      "sortiraj": this.sortOdabranaOpcijaKratica,
      "zanr": this.odabraniZanr?.z_tmdb_id 
    };
    let odgovor = await this.filmoviServis.dajFilmove(parametri);
    if (odgovor.status == 200) 
    {
      this.status = odgovor.status;

      let podaci = odgovor.filmovi.filmovi;
      console.log("PODACI " + podaci[0] + " " + JSON.stringify(podaci));

      if (this.stranicenjeFilmoviPrijedlozi.appBrojStranica == -1)
          this.stranicenjeFilmoviPrijedlozi.appBrojStranica = await this.konfServis.dajAppBrojStranica();

      let neodobreniFilmovi = podaci!.filter( (film : FilmI) => film.odobren == false);
      let brojNeodobrenih = neodobreniFilmovi.length;

      console.log("neodobreni " + JSON.stringify(neodobreniFilmovi) + " " + brojNeodobrenih); 

      let ukupno = Math.ceil(brojNeodobrenih/this.stranicenjeFilmoviPrijedlozi.appBrojStranica);
      if (ukupno == 0) ukupno = 1;

      this.stranicenjeFilmoviPrijedlozi.pohraniBrojeveStranica(ukupno, str);
      this.stranicenjeFilmoviPrijedlozi.prikaziStranicenje(str, ukupno);
      this.stranicenjeFilmoviPrijedlozi.izracunajGraniceSadrzajaZaPrikaz(str,brojNeodobrenih);
      
      this.filmovi = neodobreniFilmovi;

      if (this.filmoviZaPrikaz.length != 0) this.filmoviZaPrikaz.splice(0);

      for (let i = 0; i < this.filmovi.length; i++)
        if (i >= this.stranicenjeFilmoviPrijedlozi.donjaGranica 
          && i < this.stranicenjeFilmoviPrijedlozi.gornjaGranica)
            this.filmoviZaPrikaz.push(this.filmovi[i]);

    } 
    else if (odgovor.status == 401) 
    {
      this.status = odgovor.status;
      this.filmovi.splice(0);
      this.poruka = odgovor.poruka;
    } 
    else 
    {
      this.status = odgovor.status;

      this.poruka = odgovor.poruka;
      this.otvoriProzorPoruke();
    }
  }

  oznaciFilm(film : FilmI)
  {
    this.oznaceniFilm = film;  
  }

  otvoriDetaljeFilma(film : FilmI)
  {
    this.dialog.open(FilmInfoComponent, { data: {"film":film, "koristiTmdbPoster":true} });
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }

  indeksKlase: number = 3;

  dajKlasu() : string
  {
    this.indeksKlase = this.indeksKlase % 3;
    let brojKlase : number = this.indeksKlase;
    ++this.indeksKlase;
    let imeKlase = 'klasa_boja' + brojKlase.toString();
    
    return imeKlase;
  }

}
