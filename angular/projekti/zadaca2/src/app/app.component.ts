import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLinkActive } from '@angular/router';
import { SharedServiceService } from './servisi/shared-service.service';
import { KorisnikI } from './servisi/KorisnikI';
import { AutentifikacijaService } from './servisi/autentifikacija.service';
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from './poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  putanja = "pocetna";
  poruka = "";
  prijavljen = false;

  korisnikGost : KorisnikI = {
    korime: "", 
    ime : "",
    prezime : "",
    lozinka : "",
    email : "",
    tip_korisnika_id : 3,
    aktivan : false,
    blokiran : false,
    datum_registracije : new Date(),
    aktivacijski_kod : "",
    totp : "",
  };
  korisnik : KorisnikI = this.korisnikGost;


  validacijeURLovi : Map<string,string> = new Map<string,string>(
    [
      ["pocetna", "url_validacija"]
    ]
  );

  constructor(
    public dialog : MatDialog,
    private router: Router, 
    private lokacija : Location,
    private _sharedService: SharedServiceService,
    private authServis : AutentifikacijaService
  )
  {
    lokacija.onUrlChange((v) => {

      console.log('Promjena putanje: '+ v)
      this.provjeriKorisnickePodatke();
    })
    
    _sharedService.changeEmitted$.subscribe((objekt) => {
        console.log(objekt.korisnik);
        console.log(objekt.poruka);
        this.korisnik = objekt.korisnik;
        this.poruka = objekt.poruka;
        this.prijavljen = true;
        AutentifikacijaService.prijavljeniKorisnik = objekt.korisnik as KorisnikI;

        if (this.poruka != "Galerija" && this.poruka != "Film" && this.poruka != "Prijedlozi_obican") 
          this.router.navigate(['/pocetna']);
        else 
        {
          this.poruka = "";
        }

        if (this.poruka != "")
          this.otvoriProzorPoruke(); 
  
    });
  }

  async provjeriKorisnickePodatke()
  {
    let prijavljeniKorisnik = await this.authServis.dajKorisnikaJWT();
    console.log(prijavljeniKorisnik + " " + prijavljeniKorisnik.korime + " " + prijavljeniKorisnik.uloga);

    let korisnik = {
      korime: prijavljeniKorisnik.korime,
      tip_korisnika_id: prijavljeniKorisnik.uloga
    }

    if (korisnik.tip_korisnika_id == undefined)
    {
      this.prijavljen = false;
      this.korisnik = this.korisnikGost;
    }
    else if (korisnik.tip_korisnika_id >= 1)
    {
      this.prijavljen = true;
      this.korisnik = korisnik;
    }

  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }  
  

  odjavi()
  {
    this.authServis.odjavi();
    this.putanja = "pocetna";
    this.prijavljen = false;
    this.korisnik = this.korisnikGost;
    this.poruka = "";
    this.router.navigate(['/pocetna'])
  }
  
}
