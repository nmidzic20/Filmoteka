import { Component, ViewChild } from '@angular/core';
import { FilmI } from '../servisi/FilmI';
import { FilmoviService } from '../servisi/filmovi.service';
import { KonfiguracijaService } from '../servisi/konfiguracija.service';
import { ZanrI } from '../servisi/ZanrI';
import { ZanroviService } from '../servisi/zanrovi.service';
import { StranicenjeComponent } from '../stranicenje/stranicenje.component';
import { MatDialog } from '@angular/material/dialog';
import { FilmInfoComponent } from '../filmovi/film-info/film-info.component';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.component.html',
  styleUrls: ['./pocetna.component.scss']
})
export class PocetnaComponent {

  zanrovi = new Array<ZanrI>();
  zanroviZaPrikaz = new Array<ZanrI>();

  filmoviPoZanrovima = new Map<number, Array<FilmI>>();  
  filmovi = new Array<FilmI>();  

  oznaceniFilm : FilmI | undefined;

  @ViewChild('stranicenjePocetna') stranicenjePocetna! : StranicenjeComponent;

  constructor(
    public dialog : MatDialog,
    private filmoviServis: FilmoviService, 
    private zanroviServis: ZanroviService
  ) 
  {}

  ngOnInit()
  {
    this.dajZanrove(1); 

  }


  async dajZanrove(str : number)
  {
    this.zanroviServis.dajZanrove().then( (zanrovi) => {
      this.zanrovi = zanrovi;

      this.zanrovi.forEach(async (zanr) => {
        //console.log(zanr.z_naziv);
        let filmoviPoZanru = await this.filmoviServis.dajFilmovePoZanru(zanr.z_tmdb_id!);
        this.filmoviPoZanrovima.set(zanr.z_tmdb_id!, filmoviPoZanru);
      });
      //console.log(this.zanrovi);
      //console.log(this.filmoviPoZanrovima);

      if (this.stranicenjePocetna.appBrojStranica == -1)
        this.stranicenjePocetna.appBrojStranica = 8

      let ukupno = Math.ceil(this.zanrovi.length/this.stranicenjePocetna.appBrojStranica);
      if (ukupno == 0) ukupno = 1;

      this.stranicenjePocetna.pohraniBrojeveStranica(ukupno, str);
      this.stranicenjePocetna.prikaziStranicenje(str, ukupno);
      this.stranicenjePocetna.izracunajGraniceSadrzajaZaPrikaz(str,this.zanrovi.length);

      if (this.zanroviZaPrikaz.length != 0) this.zanroviZaPrikaz.splice(0);

      for (let i = 0; i < this.zanrovi.length; i++)
        if (i >= this.stranicenjePocetna.donjaGranica 
          && i < this.stranicenjePocetna.gornjaGranica)
            this.zanroviZaPrikaz.push(this.zanrovi[i]);
    });
  }

  oznaciFilm(film : FilmI)
  {
    this.oznaceniFilm = film;  
  }

  otvoriDetaljeFilma(film : FilmI)
  {
    let dialogRef = this.dialog.open(FilmInfoComponent, { data: {"film":film, "koristiTmdbPoster":true} });
  }

}
