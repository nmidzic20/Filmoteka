import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { FilmI } from '../../servisi/FilmI';
import { FilmoviService } from '../../servisi/filmovi.service';
import { KorisnikI } from '../../servisi/KorisnikI';
import { SharedServiceService } from '../../servisi/shared-service.service';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent {

  filmId: number | null = null;
  posterURL! : string;
  galerijaSlikaURL! : string;
  film! : FilmI;
  informacije! : Map<string,string | number>;
  poruka : string = "";

  vidljivo = true;
  korisnik! : KorisnikI;


  constructor(
    public route:ActivatedRoute, 
    private filmoviServis : FilmoviService, 
    private authServis : AutentifikacijaService,
    private _sharedService : SharedServiceService,
    private dialog : MatDialog)
  {
    this.filmId = parseInt(this.route.snapshot.paramMap.get("id")!);
    console.log(this.filmId);

    this.provjeriKorisnickePodatke();
    this.dohvatiFilm();

  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }

  originalOrder = (a: KeyValue<string,string | number>, b: KeyValue<string,string | number>): number => {
    return 0;
  }

  async dohvatiFilm()
  {
    let podaci = await this.filmoviServis.dajFilm(this.filmId!);

    this.film = podaci.film!;

    console.log("FILM");
    console.log(this.film);

    this.posterURL = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + this.film.putanja_postera;
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
      this._sharedService.emitChange({"korisnik": this.korisnik, poruka: "Film"});
    }

  }


}
