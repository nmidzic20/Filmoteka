import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { FilmComponent } from './filmovi/film/film.component';
import { PregledFilmoviComponent } from './filmovi/pregled-filmovi/pregled-filmovi.component';
import { PretrazivanjeFilmoviComponent } from './filmovi/pretrazivanje-filmovi/pretrazivanje-filmovi.component';
import { PrijedloziFilmoviComponent } from './filmovi/prijedlozi-filmovi/prijedlozi-filmovi.component';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { ProfilComponent } from './profil/profil.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { GalerijaSlikaComponent } from './slike/galerija-slika/galerija-slika.component';
import { UploadSlikeComponent } from './slike/upload-slike/upload-slike.component';
import { StranicaNijeNadjenaComponent } from './stranica-nije-nadjena/stranica-nije-nadjena.component';
import { ZanroviComponent } from './zanrovi//zanrovi/zanrovi.component';

const routes: Routes = [
  {path:"pocetna", component:PocetnaComponent},
  {path:"prijava", component:PrijavaComponent},
  {path:"registracija", component:RegistracijaComponent},
  {path:"dokumentacija", component:DokumentacijaComponent},
  {path:"profil", component:ProfilComponent},
  {path:"pretrazivanjeFilmovi", component:PretrazivanjeFilmoviComponent},
  {path:"pregledFilmovi", component:PregledFilmoviComponent},
  {path:"prijedloziFilmovi", component:PrijedloziFilmoviComponent},
  {path:"zanrovi", component:ZanroviComponent},
  {path:"uploadSlike", component:UploadSlikeComponent},
  {path:"galerijaSlika/:id", component:GalerijaSlikaComponent},
  {path:"film/:id", component:FilmComponent},
  {path:"", redirectTo:"pocetna", pathMatch:"full"},
  {path: '**', component:StranicaNijeNadjenaComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
