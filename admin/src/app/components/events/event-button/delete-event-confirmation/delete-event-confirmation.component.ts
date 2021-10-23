import { Component, Input, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-event-confirmation',
  templateUrl: './delete-event-confirmation.component.html',
  styleUrls: ['./delete-event-confirmation.component.css']
})
export class DeleteEventConfirmationComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }



  ngOnInit(): void {
  }

}
