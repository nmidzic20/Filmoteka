import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from '../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { AutentifikacijaService } from '../servisi/autentifikacija.service';
import { KorisnikI } from '../servisi/KorisnikI';
import { SharedServiceService } from '../servisi/shared-service.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.scss']
})
export class RegistracijaComponent {

  poruka = "";
  korime? : string;
  lozinka? : string;
  ime? : string;
  prezime? : string;
  email? : string;

  captcha : string = "";

  constructor(
    public dialog : MatDialog,
    private authServis : AutentifikacijaService, 
    private _sharedService : SharedServiceService,
    private recaptchaV3Service: ReCaptchaV3Service) 
  {}

  async registriraj()
  {
    this.poruka = "";
    console.log("Submitted " + this.korime + " " + this.lozinka + " " + this.ime);

    this.validirajInput();

    console.log(this.poruka);

    if(this.poruka.length == 0)
      this.provjeriRecaptchu();
    else
    {
      this.otvoriProzorPoruke();
      return;
    }
  }

  sadrziSamoRazmake(str : string)
  {
    return /^\s*$/.test(str)
  }

  async registrirajIPrijaviNovogKorisnika()
  {
    let noviKorisnik : KorisnikI = {
      korime: this.korime!,
      lozinka : this.lozinka!,
      ime : this.ime!,
      prezime : this.prezime!,
      email : this.email!
    };

    let odg = await this.authServis.registriraj(noviKorisnik);
    console.log("Registracija? " + odg);

    if (odg.korisnik != null)
    {
      let korisnik = await this.authServis.prijavi(odg.korisnik.korime, this.lozinka!); 
      if (korisnik != null)
      {
        this._sharedService.emitChange({"korisnik":korisnik, poruka:"Registrirani ste!"});
      }
      else
      {
        this.poruka = "Neispravni podaci za prijavu";
        this.otvoriProzorPoruke();
      }
    }
    else
    {
      this.poruka = odg.greska;
      this.otvoriProzorPoruke();
    }
  }

  validirajInput()
  {
    if(this.korime == undefined || this.sadrziSamoRazmake(this.korime))
      this.poruka += "Unesite korisiničko ime\n";

    if(this.lozinka == undefined || this.sadrziSamoRazmake(this.lozinka))
      this.poruka += "Unesite lozinku\n";
    
    if(this.ime == undefined || this.sadrziSamoRazmake(this.ime))
      this.poruka += "Unesite ime\n";

    if(this.prezime == undefined || this.sadrziSamoRazmake(this.prezime))
      this.poruka += "Unesite prezime\n";

    if(this.email == undefined || this.sadrziSamoRazmake(this.email))
      this.poruka += "Unesite email\n";
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }

  provjeriRecaptchu()
  {
    this.recaptchaV3Service.execute('importantAction')
    .subscribe(async (token: string) => {
      console.log(`Recaptcha token: [${token}]`);
      this.captcha = token;
      if (this.captcha != "")
        await this.registrirajIPrijaviNovogKorisnika();
      else
      {
        this.poruka = "Captcha nije prošla";
        this.otvoriProzorPoruke();
      }
    });
  }

}
