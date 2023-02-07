import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-poruka-dijaloski-prozor',
  templateUrl: './poruka-dijaloski-prozor.component.html',
  styleUrls: ['./poruka-dijaloski-prozor.component.scss']
})
export class PorukaDijaloskiProzorComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public poruka : string,
    private dialogRef: MatDialogRef<PorukaDijaloskiProzorComponent>,
  )
  {}


}
