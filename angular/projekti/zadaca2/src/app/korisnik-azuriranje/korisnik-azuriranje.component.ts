import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AutentifikacijaService } from '../servisi/autentifikacija.service';
import { KorisniciService } from '../servisi/korisnici.service';
import { KorisnikI } from '../servisi/KorisnikI';

@Component({
  selector: 'app-korisnik-azuriranje',
  templateUrl: './korisnik-azuriranje.component.html',
  styleUrls: ['./korisnik-azuriranje.component.scss']
})
export class KorisnikAzuriranjeComponent {

  ime = "";
  prezime = "";

  poruka = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public korisnik : KorisnikI,
    private dialogRef: MatDialogRef<KorisnikAzuriranjeComponent>,
    private korisniciServis : KorisniciService, private authServis: AutentifikacijaService)
  {}

  async azuriraj()
  {
    let azuriraniKorisnik : KorisnikI = this.korisnik;
    azuriraniKorisnik.ime = this.ime;
    azuriraniKorisnik.prezime = this.prezime

    if (azuriraniKorisnik.ime != null && !this.sadrziSamoRazmake(this.ime)
      && azuriraniKorisnik.prezime != null && !this.sadrziSamoRazmake(this.prezime))
    {

      AutentifikacijaService.prijavljeniKorisnik!.ime = azuriraniKorisnik.ime;
      AutentifikacijaService.prijavljeniKorisnik!.prezime = azuriraniKorisnik.prezime;

      let poruka = await this.korisniciServis.azuriraj(azuriraniKorisnik);
      this.dialogRef.close({event:"Azurirano", data:poruka});
    }
    else
    {
      this.poruka = "Podaci ne mogu biti prazni!";
    }
  }

  sadrziSamoRazmake(str : string)
  {
    return /^\s*$/.test(str);
  }

}
