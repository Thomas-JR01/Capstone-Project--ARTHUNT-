import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  InstructionBlock: Array<number> = [0,1,2,3,4,5];

  constructor() { }

  ngOnInit(): void {
  }

}
