import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { FilmoviService } from '../../servisi/filmovi.service';
import { FilmPretrazivanjeTMDB_I } from '../../servisi/FilmPretrazivanjeTMDB_I';
import { GumbI } from '../../servisi/GumbI';
import { StranicenjeComponent } from '../../stranicenje/stranicenje.component';

@Component({
  selector: 'app-pretrazivanje-filmovi',
  templateUrl: './pretrazivanje-filmovi.component.html',
  styleUrls: ['./pretrazivanje-filmovi.component.scss']
})
export class PretrazivanjeFilmoviComponent {

  poruka : string = "";
  kljucneRijeciFiltar : string = "";
  oznaceniFilm? : FilmPretrazivanjeTMDB_I;

  filmovi : Array<FilmPretrazivanjeTMDB_I> = new Array<FilmPretrazivanjeTMDB_I>();
  status : number = 200;

  @ViewChild('stranicenjeFilmoviPretrazivanje') stranicenjeFilmoviPretrazivanje! : StranicenjeComponent;


  constructor(
    public dialog : MatDialog,
    private filmoviServis : FilmoviService)
  {
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
    let parametri = {
      "str": str,
      "filter" : this.kljucneRijeciFiltar
    };
    let odgovor = await this.filmoviServis.dajFilmoveTMDB(parametri);
    if (odgovor.status == 200) 
    {
      this.status = odgovor.status;
      let ukupno = 500;
      this.prikaziFilmove(odgovor.filmovi.results);
      this.stranicenjeFilmoviPretrazivanje.kolicinaSadrzajaZaPrikaz = odgovor.filmovi.results.length;
      this.stranicenjeFilmoviPretrazivanje.pohraniBrojeveStranica(ukupno, str);
      this.stranicenjeFilmoviPretrazivanje.prikaziStranicenje(odgovor.filmovi.page, ukupno);
    } 
    else if (odgovor.status == 401) 
    {
      this.status = odgovor.status;
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

  prikaziFilmove(filmovi : Array<FilmPretrazivanjeTMDB_I>) 
  {
    this.filmovi = filmovi;
  }

  async dodajUBazu(film : FilmPretrazivanjeTMDB_I) 
  {
    let odgovor = await this.filmoviServis.dodajUBazu(film);

    this.poruka = odgovor.poruka;
    this.otvoriProzorPoruke();
    
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }

  oznaciFilm(film : FilmPretrazivanjeTMDB_I)
  {
    this.oznaceniFilm = film;
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
