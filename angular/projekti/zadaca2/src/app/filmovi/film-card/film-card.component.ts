import { Component, EventEmitter, Input, Output } from '@angular/core';
import {MatCardModule} from '@angular/material/card'; 
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { FilmI } from '../../servisi/FilmI';
import { FilmoviService } from '../../servisi/filmovi.service';

@Component({
  selector: 'app-film-card',
  templateUrl: './film-card.component.html',
  styleUrls: ['./film-card.component.scss']
})
export class FilmCardComponent {

  @Input() filmCard! : FilmI;
  @Input() klasaBojaKartice! : string;

  poruka : string = "";
  @Input() filmoviPrijedlozi : boolean = false;
  @Output() filmOdobrenIliIzbrisan = new EventEmitter<number>();



  constructor(public dialog : MatDialog, private filmoviServis : FilmoviService)
  {

  }

  async obrisi()
  {
    let podaci = await this.filmoviServis.obrisiFilmIzBaze(this.filmCard);
    console.log(podaci);

    this.poruka = "Film obrisan iz baze!";  
    this.otvoriProzorPoruke(); 

    this.filmOdobrenIliIzbrisan.emit();

  }

  async odobri()
  {
    let podaci = await this.filmoviServis.odobriFilm(this.filmCard);

    console.log(podaci);

    this.poruka = "Film " + this.filmCard.tmdb_id + " odobren!";

    await this.preuzmiPoster();

    this.filmOdobrenIliIzbrisan.emit();

  }

  async preuzmiPoster()
  {
    let podaci = await this.filmoviServis.preuzmiPosterFilma(this.filmCard);
    console.log(podaci);

    this.poruka += " Preuzet je poster za ovaj film";
    this.otvoriProzorPoruke();
    
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }




}
