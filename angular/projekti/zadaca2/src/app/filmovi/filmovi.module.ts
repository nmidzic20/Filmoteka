import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { PregledFilmoviComponent } from './pregled-filmovi/pregled-filmovi.component';
import { PretrazivanjeFilmoviComponent } from './pretrazivanje-filmovi/pretrazivanje-filmovi.component';
import { PrijedloziFilmoviComponent } from './prijedlozi-filmovi/prijedlozi-filmovi.component';
import { FilmInfoComponent } from './film-info/film-info.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card';
import { FilmComponent } from './film/film.component';


@NgModule({
  declarations: [
    PregledFilmoviComponent,
    PretrazivanjeFilmoviComponent,
    PrijedloziFilmoviComponent,
    FilmInfoComponent,
    FilmComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatDialogModule,
    MatGridListModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class FilmoviModule { }
