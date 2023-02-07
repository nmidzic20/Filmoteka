import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StranicenjeComponent } from '../stranicenje/stranicenje.component';
import { PodnozjeComponent } from '../podnozje/podnozje.component';
import { PorukaDijaloskiProzorComponent } from '../poruka-dijaloski-prozor/poruka-dijaloski-prozor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FilmCardComponent } from '../filmovi/film-card/film-card.component';
import {MatCardModule} from '@angular/material/card'; 
import {MatGridListModule} from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  declarations: [
    StranicenjeComponent,
    PodnozjeComponent,
    PorukaDijaloskiProzorComponent,
    FilmCardComponent

  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule
  ],
  exports: [
    StranicenjeComponent,
    PodnozjeComponent,
    PorukaDijaloskiProzorComponent,
    FilmCardComponent
  ]
})
export class SharedModule { }
