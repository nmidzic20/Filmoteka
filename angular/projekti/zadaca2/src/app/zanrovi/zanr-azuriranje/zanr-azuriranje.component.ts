import { Component, Input, Inject } from '@angular/core';
import { ZanroviService } from '../../servisi/zanrovi.service';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ZanrI } from '../../servisi/ZanrI';

@Component({
  selector: 'app-zanr-azuriranje',
  templateUrl: './zanr-azuriranje.component.html',
  styleUrls: ['./zanr-azuriranje.component.scss']
})
export class ZanrAzuriranjeComponent {

  @Input() noviNazivZanra = "";
  poruka = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public zanr : ZanrI,
    private dialogRef: MatDialogRef<ZanrAzuriranjeComponent>,
    private zanroviServis : ZanroviService)
  {}

  async azuriraj()
  {
    if (this.noviNazivZanra != "" && this.noviNazivZanra != null)
    {
      let poruka = await this.zanroviServis.azurirajZanr(this.zanr, this.noviNazivZanra);
      this.dialogRef.close({event:"Azurirano", data:poruka});
    }
    else
    {
      this.poruka = "Unesite željeni naziv!";
    }
  }


}
