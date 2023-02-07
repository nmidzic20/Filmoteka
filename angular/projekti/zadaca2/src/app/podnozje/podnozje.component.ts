import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-podnozje',
  templateUrl: './podnozje.component.html',
  styleUrls: ['./podnozje.component.scss']
})
export class PodnozjeComponent {

  @Input() validacijaURL : string = "";

}
