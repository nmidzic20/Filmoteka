import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { environment } from '../../environments/environment';
import { PorukaDijaloskiProzorComponent } from '../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { AutentifikacijaService } from '../servisi/autentifikacija.service';
import { SharedServiceService } from '../servisi/shared-service.service';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.scss']
})
export class PrijavaComponent {

  korime? : string;
  lozinka? : string;
  poruka = "";
  captcha : string = "";
  url = environment.appServis + "prijava";


  @Output() ispravnaPrijava = new EventEmitter<string>();


  constructor(
    public dialog : MatDialog,
    private authServis : AutentifikacijaService,
    private _sharedService: SharedServiceService,
    private recaptchaV3Service: ReCaptchaV3Service) 
  {}

  async prijavi()
  {
    this.poruka = "";
    console.log("Submitted " + this.korime + " " + this.lozinka);

    if(this.korime == undefined || this.sadrziSamoRazmake(this.korime))
    {
      this.poruka += "Unesite korisiničko ime\n";
    }

    if (this.lozinka == undefined || this.sadrziSamoRazmake(this.lozinka))
    {
      this.poruka += "Unesite lozinku\n";
    }

    if (this.poruka.length == 0)
    {
      this.provjeriRecaptchu();
    }
    else
    {
      this.otvoriProzorPoruke();
      return;
    }
  }

  sadrziSamoRazmake(str : string)
  {
    return /^\s*$/.test(str);
  }

  async provjeriPrijavu()
  {
    let korisnik = await this.authServis.prijavi(this.korime!, this.lozinka!);
    console.log("Prijava? " + korisnik);

    if (korisnik != null)
    {
      this._sharedService.emitChange({"korisnik":korisnik, poruka:""});
    }
    else
    {
      this.poruka = "Neispravni podaci za prijavu";
      this.otvoriProzorPoruke();
    }
  }

  provjeriRecaptchu()
  {
    this.recaptchaV3Service.execute('importantAction')
    .subscribe(async (token: string) => {
      console.log(`Recaptcha token: [${token}]`);
      this.captcha = token;
      if (this.captcha != "")
        await this.provjeriPrijavu();
      else
      {
        this.poruka = "Captcha nije prošla";
        this.otvoriProzorPoruke();
      }
    });
  }

  otvoriProzorPoruke()
  {
    this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
  }


}
