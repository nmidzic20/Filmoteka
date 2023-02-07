import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZanroviComponent } from './zanrovi/zanrovi.component';
import { ZanrAzuriranjeComponent } from './zanr-azuriranje/zanr-azuriranje.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    ZanroviComponent,
    ZanrAzuriranjeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    SharedModule,
    MatButtonModule
  ]
})
export class ZanroviModule { }
