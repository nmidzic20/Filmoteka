import { Component, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { GumbI } from '../servisi/GumbI';

@Component({
  selector: 'app-stranicenje',
  templateUrl: './stranicenje.component.html',
  styleUrls: ['./stranicenje.component.scss']
})
export class StranicenjeComponent {

  funkcijaZaDohvat! : Function;
  trenutnaStranica : number = 1;
  ukupnoStranica! : number;

  appBrojStranica : number = -1;

  gornjaGranica! : number;
  donjaGranica! : number;

  kolicinaSadrzajaZaPrikaz : number = 0;

  gumbNatrag : GumbI = { vidljiv:false, skociNaStranicu:-1};
  gumbNaprijed : GumbI = { vidljiv:true, skociNaStranicu:-1};
  gumbTrenutnaStranica : GumbI = { vidljiv:true, skociNaStranicu:-1};
  gumbPrvi : GumbI = { vidljiv:false, skociNaStranicu: 1};
  gumbZadnji : GumbI = { vidljiv:true, skociNaStranicu:-1};

  @Output() promjenaStranicenje = new EventEmitter<number>();

  klikPromjenaStranice(skociNaStr : number)
  {
    console.log("promjena Stranice " + skociNaStr);
    this.promjenaStranicenje.emit(skociNaStr);

  }

  pohraniBrojeveStranica(ukupno : number, str : number)
  {
    this.ukupnoStranica = ukupno;
    this.trenutnaStranica = str;
    console.log("pohrani brojeve stranica " + this.ukupnoStranica + " " + this.trenutnaStranica);
  }

  izracunajGraniceSadrzajaZaPrikaz(str : number, sadrzajKolicina : number)
  {
    this.kolicinaSadrzajaZaPrikaz = sadrzajKolicina;

    this.donjaGranica = (str-1)*this.appBrojStranica;
    let ostatak = sadrzajKolicina % this.appBrojStranica;
    this.gornjaGranica = (this.appBrojStranica * str <= sadrzajKolicina) ? this.appBrojStranica * str : this.appBrojStranica * (str-1) + ostatak;

    console.log("izracunaj granice " + this.donjaGranica + " " + this.gornjaGranica);

  }

  prikaziStranicenje(str : number, ukupno : number)
  {
    console.log("Stranica str: " + str + " ukupno " + ukupno);
    if (str > 1)
    {
      this.gumbPrvi.vidljiv = true;
      this.gumbNatrag.vidljiv = true;
      this.gumbNatrag.skociNaStranicu = str-1;

    }
    else
    {
      this.gumbPrvi.vidljiv = false;
      this.gumbNatrag.vidljiv = false;
    }
    this.gumbTrenutnaStranica.skociNaStranicu = this.trenutnaStranica;
    if (str < ukupno)
    {
      this.gumbZadnji.vidljiv = true;
      this.gumbZadnji.skociNaStranicu = ukupno;

      this.gumbNaprijed.vidljiv = true;
      this.gumbNaprijed.skociNaStranicu = str+1;
    }
    else
    {
      this.gumbZadnji.vidljiv = false;
      this.gumbNaprijed.vidljiv = false;
    }
  }


}
