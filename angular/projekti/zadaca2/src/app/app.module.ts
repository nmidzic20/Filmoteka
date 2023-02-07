import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { ProfilComponent } from './profil/profil.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FilmoviModule } from './filmovi/filmovi.module';
import { SharedModule } from './shared/shared.module';
import { ZanroviModule } from './zanrovi/zanrovi.module';
import { SlikeModule } from './slike/slike.module';
import { StranicaNijeNadjenaComponent } from './stranica-nije-nadjena/stranica-nije-nadjena.component';
import { RouterModule } from '@angular/router';
import {MatCardModule} from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { KorisnikAzuriranjeComponent } from './korisnik-azuriranje/korisnik-azuriranje.component'
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from '../environments/environment';



@NgModule({
  declarations: [
    AppComponent,
    PocetnaComponent,
    PrijavaComponent,
    RegistracijaComponent,
    DokumentacijaComponent,
    ProfilComponent,
    StranicaNijeNadjenaComponent,
    KorisnikAzuriranjeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    FilmoviModule,
    ZanroviModule,
    SharedModule,
    SlikeModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatGridListModule,
    RecaptchaV3Module
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptcha.siteKey,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
