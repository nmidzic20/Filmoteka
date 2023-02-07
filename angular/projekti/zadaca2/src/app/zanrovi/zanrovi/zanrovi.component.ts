import { Component, ViewChild } from '@angular/core';
import { GumbI } from '../../servisi/GumbI';
import { KonfiguracijaService } from '../../servisi/konfiguracija.service';
import { ZanrI } from '../../servisi/ZanrI';
import { ZanroviService } from '../../servisi/zanrovi.service';
import { StranicenjeComponent } from '../../stranicenje/stranicenje.component';
import { ZanrAzuriranjeComponent } from './../zanr-azuriranje/zanr-azuriranje.component';
import { MatDialog } from '@angular/material/dialog';
import { PorukaDijaloskiProzorComponent } from '../../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { SharedServiceService } from '../../servisi/shared-service.service';

@Component({
  selector: 'app-zanrovi',
  templateUrl: './zanrovi.component.html',
  styleUrls: ['./zanrovi.component.scss']
})
export class ZanroviComponent {

    poruka : string = "";
    //poruka2 : string = "";

    zanrovi : Array<ZanrI> = new Array<ZanrI>();
    zanroviTMDB : Array<any> = new Array<any>();

    status = 200;

    @ViewChild('stranicenjeZanrovi') stranicenjeZanrovi! : StranicenjeComponent;
    @ViewChild('stranicenjeZanroviTMDB') stranicenjeZanroviTMDB! : StranicenjeComponent;

    constructor(
        public dialog : MatDialog,
        private zanroviServis : ZanroviService, 
        private konfServis : KonfiguracijaService,
        private authServis : AutentifikacijaService,
        private _sharedService : SharedServiceService)
    {
        this.provjeriKorisnika();
    }

    async provjeriKorisnika()
    {
        let admin = await this.authServis.provjeriAdmin();
        let prijavljen = await this.authServis.provjeriAutorizaciju();

        if (!admin && prijavljen)
        {
            this.status = 403;
            this.poruka = "Neautorizirani pristup! Niste administrator!"
            this.otvoriProzorPoruke();

            let prijavljeniKorisnik = await this.authServis.dajKorisnikaJWT();
            console.log(prijavljeniKorisnik + " " + prijavljeniKorisnik.korime + " " + prijavljeniKorisnik.uloga);

            let korisnik = {
                korime: prijavljeniKorisnik.korime,
                tip_korisnika_id: prijavljeniKorisnik.uloga
            }
            this._sharedService.emitChange({"korisnik": korisnik, poruka: "Prijedlozi_obican"});
        }
        else if (admin)
        {
            this.dajZanrove(1);
        }
        else
        {
            this.status = 401;
            this.poruka = "Neautorizirani pristup! Prijavite se!"
            this.otvoriProzorPoruke();
        }
        
    }

    async obrisiSveZanroveBezFilmova () 
    {
        await this.zanroviServis.obrisiSveZanroveBezFilmova();
        await this.dajZanrove(1);
        this.poruka = "Obrisani svi žanrovi za koje ne postoje filmovi u bazi";
        //this.poruka2 = "";
        this.otvoriProzorPoruke();
    }
  

    async dajZanrove(str : number) 
    {
        let podaci = await this.zanroviServis.dajSveZanroveAdmin();
        if (podaci!.greska != "") 
        {
            this.poruka = podaci!.greska!;
            this.otvoriProzorPoruke();
            return;
        }

        this.zanrovi = podaci?.podaci;

        if (this.stranicenjeZanrovi.appBrojStranica == -1)
            this.stranicenjeZanrovi.appBrojStranica = await this.konfServis.dajAppBrojStranica();

        let ukupno = Math.ceil(this.zanrovi.length/this.stranicenjeZanrovi.appBrojStranica);
        if (ukupno == 0) ukupno = 1;

        this.stranicenjeZanrovi.pohraniBrojeveStranica(ukupno, str);
        this.stranicenjeZanrovi.prikaziStranicenje(str, ukupno);
        this.stranicenjeZanrovi.izracunajGraniceSadrzajaZaPrikaz(str, this.zanrovi.length);

    }


    async azurirajZanr(zanr : ZanrI)
    {
        console.log("poslani zanr " + zanr.z_naziv);
        let dialogRef = this.dialog.open(ZanrAzuriranjeComponent, { data: zanr});

        let poruka = "";

        dialogRef.afterClosed().subscribe(result => {

            if (result.event == 'Azurirano')
            {
                console.log(result.data);
                poruka = result.data;
                this.poruka = poruka;
                this.otvoriProzorPoruke();
                this.dajZanrove(1);
            }
        });

    }

    async obrisiZanr(zanr : ZanrI)
    {
        let podaci = await this.zanroviServis.obrisiZanr(zanr);
        console.log(podaci);

        await this.dajZanrove(1);

        for (let z of this.zanrovi) 
        {
            if (zanr.z_tmdb_id == z.z_tmdb_id) 
            {  
                this.poruka = "Ovaj žanr se ne može obrisati jer ima filmova pod njime";
                this.otvoriProzorPoruke();
                return;
            }
            this.poruka = "Žanr obrisan iz baze!";  
        }
        this.otvoriProzorPoruke();

 
    }


    async dajZanroveTMDB(str : number)
    {
        
        if (this.zanroviTMDB.length == 0)
        {
            let podaci = await this.zanroviServis.dohvatiZanroveTMDB();
            console.log("Prvo i jedino dohvaćanje svih žanrova s TMDB-a: " + JSON.stringify(podaci));
            this.zanroviTMDB = podaci.genres;
        }

        if (this.stranicenjeZanroviTMDB.appBrojStranica == -1)
            this.stranicenjeZanroviTMDB.appBrojStranica = await this.konfServis.dajAppBrojStranica();

        let ukupno = Math.ceil(this.zanroviTMDB.length/this.stranicenjeZanroviTMDB.appBrojStranica);
        if (ukupno == 0) ukupno = 1;

        this.stranicenjeZanroviTMDB.pohraniBrojeveStranica(ukupno, str);
        this.stranicenjeZanroviTMDB.prikaziStranicenje(str, ukupno);
        this.stranicenjeZanroviTMDB.izracunajGraniceSadrzajaZaPrikaz(str, this.zanroviTMDB.length);

    }

    async dodajSve()
    {
        let postojeciZanrovi : any = [];

        for (let zanr of this.zanroviTMDB) 
        {
            await this.dodajZanr(zanr.id, postojeciZanrovi, false);
        }
        let imenaPostojecih = [];
        let imenaNovoDodanih = [];

        for (let p of postojeciZanrovi) 
            imenaPostojecih.push(p.name);

        for (let z of this.zanroviTMDB) 
            if (!postojeciZanrovi.includes(z))
                imenaNovoDodanih.push(z.name);

        this.poruka = "Dodani su žanrovi: " + imenaNovoDodanih;
        this.poruka += " Žanrovi koji već postoje u bazi: " + imenaPostojecih;
        this.otvoriProzorPoruke();

    }

    async dodajZanr(id : number, postojeciZanrovi : any[] = [], dodavanjeJednogZanra = true)
    {
        let zanroviTMDB = this.zanroviTMDB;
        let zanroviuBazi = this.zanrovi;

        for (let zanr of zanroviTMDB) 
        {
            if (id == zanr.id && !zanroviuBazi.some(el => el.z_tmdb_id == id)) 
            {
                //console.log("Dodavanje zanra " + id + " " + zanr.id + " " + zanroviuBazi.some(el => el.z_tmdb_id == id));

                let podaci = await this.zanroviServis.dodajZanr(zanr);

                if (podaci) 
                {
                    if (dodavanjeJednogZanra)
                    {
                        this.poruka = "Žanr " + zanr.name + " dodan u bazu!";
                        this.otvoriProzorPoruke();
                    }
                    await this.dajZanrove(1);
                } 
                else 
                {
                    this.poruka = "Greška pri dodavanju";
                    this.otvoriProzorPoruke();
                }
                break;
            }
            else if (id == zanr.id && zanroviuBazi.some(el => el.z_tmdb_id == id))
            {
                if (dodavanjeJednogZanra)
                {
                    this.poruka = "Žanr " + zanr.name + " već postoji u bazi";
                    this.otvoriProzorPoruke();
                }
                postojeciZanrovi.push(zanr);
                break;
            }
        }
    }

    otvoriProzorPoruke()
    {
        this.dialog.open(PorukaDijaloskiProzorComponent, { data: this.poruka});
    }

}
