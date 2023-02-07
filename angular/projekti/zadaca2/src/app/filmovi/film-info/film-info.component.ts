import { Component, Inject, Input } from '@angular/core';
import { FilmI } from '../../servisi/FilmI';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-film-info',
  templateUrl: './film-info.component.html',
  styleUrls: ['./film-info.component.scss']
})
export class FilmInfoComponent {

  koristiTmdbPoster : boolean = false;
  posterURL : string;
  galerijaSlikaURL : string;
  film! : FilmI;
  informacije : Map<string,string | number>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data : any,
    private dialogRef: MatDialogRef<FilmInfoComponent>)
  {
    this.film = data.film;
    this.koristiTmdbPoster = data.koristiTmdbPoster;

    console.log(JSON.stringify(data));

    this.posterURL = (this.koristiTmdbPoster) ? "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + this.film.putanja_postera : "./posteri/" + this.film?.tmdb_id + ".jpg";
    this.galerijaSlikaURL = "/galerijaSlika/" + this.film.tmdb_id + "?film=" + this.film.naziv;

    this.informacije = new Map<string,string | number>(
      [
        ["Dodao korisnik", this.film.korisnik_dodao],
        ["Datum dodan", this.film.datum_dodan],
        ["Datum izlaska",this.film.datum_izlaska],
        ["Originalni jezik", this.film.originalni_jezik],
        ["Originalni naslov",this.film.originalni_naslov],
        ["Originalni naziv žanra", this.film.originalni_naziv!],
        ["TMDB ID", this.film.tmdb_id],
        ["IMDB ID", this.film.imdb_id],
        ["Broj glasova", this.film.broj_glasova],
        ["Prosjek glasova", this.film.prosjek_glasova],
        ["Popularnost", this.film.popularnost],
        ["Prihod", this.film.prihod],
        ["Budžet", this.film.budzet!],
        ["Video", this.film.video ? "Da" : "Ne"],
        ["Odrasli film", this.film.odrasli_film ? "Da" : "Ne"],
        ["Početna stranica", this.film.pocetna_stranica],
        ["Putanja pozadine", this.film.putanja_pozadine],
        ["Putanja postera", this.film.putanja_postera]
  
      ]
    );
  }

  originalOrder = (a: KeyValue<string,string | number>, b: KeyValue<string,string | number>): number => {
    return 0;
  }

}
