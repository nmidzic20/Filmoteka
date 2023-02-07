import { Component, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { FilmI } from '../../servisi/FilmI';
import { FilmoviService } from '../../servisi/filmovi.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-upload-slike',
  templateUrl: './upload-slike.component.html',
  styleUrls: ['./upload-slike.component.scss']
})
export class UploadSlikeComponent {

  poruka : string = "";
  filmovi : Array<FilmI> = new Array<FilmI>();
  odabraniFilmNaziv : string = "--";
  slika : File | null = null;

  formaVidljiva = true;
  validacija = false;
  dozvoljeneEkstenzije = ["jpg", "jpeg", "png", "gif"];
  dozvoljenaVelicinaBajtovi = 512000;

  captcha : string = "";

  constructor(
    public dialog : MatDialog,
    private fb: FormBuilder, 
    private filmoviServis : FilmoviService,
    private recaptchaV3Service: ReCaptchaV3Service
  )
  {
    this.popuniSelectFilmovi();

  }

  async popuniSelectFilmovi()
  {
    let parametri = {
      "stranica": 1,
      "filter": "",
      "datum": "",
      "sortiraj": "",
      "zanr": "" 
    };
    let odgovor = await this.filmoviServis.dajFilmove(parametri);
    if (odgovor.status == 200) 
    {
      let podaci = odgovor.filmovi.filmovi;
      this.filmovi = podaci!.filter( (film : FilmI) => film.odobren == true);
    } 
    else if (odgovor.status == 401) 
    {
      this.filmovi.splice(0); //ocisti polje
      this.poruka = odgovor.poruka;//"Neautorizirani pristup! Prijavite se!"
      this.formaVidljiva = false;
      this.otvoriProzorPoruke();
    } 
    else 
    {
      this.poruka = odgovor.poruka;//"Greška u dohvatu filmova!"
      this.otvoriProzorPoruke();
    }

  }

  dajOdabraniFilm(odabranaVrijednost : string)
  {
    console.log(odabranaVrijednost);
    this.odabraniFilmNaziv = odabranaVrijednost; 
    this.validiraj();
  }

  onFileSelected(event : any)
  {
    this.slika = event.target.files[0];
    this.validiraj();
  }

  validiraj()
  {
    console.log("VALIDIRAJ");
    this.validirajFilm();
    console.log("val " + this.validacija + " " + this.slika);
    if (this.slika != null && this.validacija == true)
      this.validirajSliku();

    if (this.slika == null && this.validacija == true) 
    {
      this.validacija = false;
    }
    
    if (this.validacija)
      this.provjeriRecaptchu();
  }

  validirajFilm()
  {
    if (this.odabraniFilmNaziv == "--")
    {
      this.validacija = false;
      this.poruka = "Odaberite film za koji želite prenijeti sliku";
      this.otvoriProzorPoruke();
      return;
    }
    this.validacija = true;
    this.poruka = "";
  }

  validirajSliku()
  {
    let ekstenzija = this.slika!.type.split("/")[1];
    let velicinaBajtovi = this.slika!.size;

    console.log(this.slika + " " + velicinaBajtovi);
    console.log("ext " + ekstenzija);

    if (!this.dozvoljeneEkstenzije.some(e => e == ekstenzija))
    {
      this.validacija = false;
      this.poruka = "Dozvoljene ekstenzije za sliku: " + this.dozvoljeneEkstenzije;
      this.otvoriProzorPoruke();
      return;
    }
      
    if (velicinaBajtovi > this.dozvoljenaVelicinaBajtovi)
    {
      this.validacija = false;
      this.poruka = "Veličina slike ne može biti preko 500KB!";
      this.otvoriProzorPoruke();
      return;
    }

    this.validacija = true;
    this.poruka = "";
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }

  provjeriRecaptchu()
  {
    this.recaptchaV3Service.execute('importantAction')
    .subscribe((token: string) => {
      console.log(`Recaptcha token: [${token}]`);
      this.captcha = token;
      if (this.captcha == "")
      {
        this.poruka = "Captcha nije prošla";
        this.otvoriProzorPoruke();
      }
    });
  }
  

}
