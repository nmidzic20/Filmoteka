import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KorisnikAzuriranjeComponent } from '../korisnik-azuriranje/korisnik-azuriranje.component';
import { PorukaDijaloskiProzorComponent } from '../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { AutentifikacijaService } from '../servisi/autentifikacija.service';
import { KorisniciService } from '../servisi/korisnici.service';
import { KorisnikI } from '../servisi/KorisnikI';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent {

  poruka : string = "";
  korisnik : KorisnikI | null= null;

  kor_podaci! : Map<string, string>;

  constructor(
    public dialog : MatDialog,
    private authServis : AutentifikacijaService,
    private korisniciServis : KorisniciService)
  {
    this.prikaziKorisnika();
  }

  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }

  async prikaziKorisnika()
  {
    /*this.korisnik = AutentifikacijaService.prijavljeniKorisnik;
    console.log("PROFIL: " + JSON.stringify(this.korisnik));*/

    let podaci = await this.authServis.dajPrijavljenogKorisnika();

    if (podaci == null)
    {
      this.poruka = "Neautorizirani pristup! Prijavite se!";
      this.otvoriProzorPoruke();
    }
    else
    {
      console.log(podaci + " " + JSON.stringify(podaci));
      
      this.korisnik = podaci;
      console.log(this.korisnik);

      this.kor_podaci = new Map ([
        ["Ime", this.korisnik?.ime!],
        ["Prezime", this.korisnik?.prezime!], 
        ["Lozinka", this.korisnik?.lozinka!], 
        ["E-mail", this.korisnik?.email!], 
        ["Aktivan", this.korisnik?.aktivan! ? "Da" : "Ne"], 
        ["Blokiran", this.korisnik?.blokiran! ? "Da" : "Ne"],
        ["Vrijeme registracije", this.korisnik?.datum_registracije?.toString()!], 
        ["Aktivacijski kod", this.korisnik?.aktivacijski_kod!],
        ["TOTP", this.korisnik?.totp!]
      ]);
    }

  }

  azuriraj()
  {
    let dialogRef = this.dialog.open(KorisnikAzuriranjeComponent, { data: this.korisnik});

    let poruka = "";

    dialogRef.afterClosed().subscribe(result => {

      if (result.event == 'Azurirano')
      {
        console.log(result.data);
        poruka = result.data;
        this.poruka = poruka;
        this.otvoriProzorPoruke();
        this.prikaziKorisnika();
      }
    });
  }
}
