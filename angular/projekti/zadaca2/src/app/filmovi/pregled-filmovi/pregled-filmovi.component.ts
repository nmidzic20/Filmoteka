import { Component, ViewChild } from '@angular/core';
import { FilmI } from '../../servisi/FilmI';
import { FilmoviService } from '../../servisi/filmovi.service';
import { KonfiguracijaService } from '../../servisi/konfiguracija.service';
import { ZanrI } from '../../servisi/ZanrI';
import { ZanroviService } from '../../servisi/zanrovi.service';
import { StranicenjeComponent } from '../../stranicenje/stranicenje.component';
import { FilmInfoComponent } from '../film-info/film-info.component';
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';

@Component({
  selector: 'app-pregled-filmovi',
  templateUrl: './pregled-filmovi.component.html',
  styleUrls: ['./pregled-filmovi.component.scss']
})

export class PregledFilmoviComponent {

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

  @ViewChild('stranicenjeFilmoviPregled') stranicenjeFilmoviPregled! : StranicenjeComponent;

  constructor(
    public dialog : MatDialog,
    private zanroviServis : ZanroviService, 
    private filmoviServis : FilmoviService,
    private konfServis : KonfiguracijaService)
  {
    this.prikaziZanrove();
    this.dajFilmove(1);
  }

  ngDoCheck()
  {
    console.log("Statusi: " + this.odabraniDatum + " " + this.odabraniZanr?.z_naziv + " " + this.sortOdabranaOpcija);
  }

  oznaciFilm(film : FilmI)
  {
    this.oznaceniFilm = film;  
  }

  otvoriDetaljeFilma(film : FilmI)
  {
    let dialogRef = this.dialog.open(FilmInfoComponent, { data: {"film":film, "koristiTmdbPoster":false} });
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

      if (this.stranicenjeFilmoviPregled.appBrojStranica == -1)
          this.stranicenjeFilmoviPregled.appBrojStranica = await this.konfServis.dajAppBrojStranica();

      let odobreniFilmovi = podaci!.filter( (film : FilmI) => film.odobren == true);
      let brojOdobrenih = odobreniFilmovi.length;

      console.log("odobreni " + JSON.stringify(odobreniFilmovi) + " " + brojOdobrenih); 

      let ukupno = Math.ceil(brojOdobrenih/this.stranicenjeFilmoviPregled.appBrojStranica);
      if (ukupno == 0) ukupno = 1;

      this.stranicenjeFilmoviPregled.pohraniBrojeveStranica(ukupno, str);
      this.stranicenjeFilmoviPregled.prikaziStranicenje(str, ukupno);
      this.stranicenjeFilmoviPregled.izracunajGraniceSadrzajaZaPrikaz(str,brojOdobrenih);

      this.filmovi = odobreniFilmovi;

      if (this.filmoviZaPrikaz.length != 0) this.filmoviZaPrikaz.splice(0);

      for (let i = 0; i < this.filmovi.length; i++)
        if (i >= this.stranicenjeFilmoviPregled.donjaGranica 
          && i < this.stranicenjeFilmoviPregled.gornjaGranica)
            this.filmoviZaPrikaz.push(this.filmovi[i]);

    } 
    else if (odgovor.status == 401) 
    {
      this.status = odgovor.status;
      this.filmovi.splice(0); 
      this.poruka = odgovor.poruka;
      this.otvoriProzorPoruke();
    } 
    else 
    {
      this.status = odgovor.status;
      this.poruka = odgovor.poruka;
      this.otvoriProzorPoruke();
    }
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