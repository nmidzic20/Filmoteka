import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadSlikeComponent } from './upload-slike/upload-slike.component';
import { GalerijaSlikaComponent } from './galerija-slika/galerija-slika.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';  
import { SharedModule } from '../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    UploadSlikeComponent,
    GalerijaSlikaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    SharedModule,
    MatButtonModule
  ]
})
export class SlikeModule { }
