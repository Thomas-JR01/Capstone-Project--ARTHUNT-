import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DeleteEventConfirmationComponent } from './delete-event-confirmation/delete-event-confirmation.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-event-button',
  templateUrl: './event-button.component.html',
  styleUrls: ['./event-button.component.css']
})
export class EventButtonComponent implements OnInit {
  @Input() event: {_id: Number, name: String, city: String} | undefined;
  PresentationName: any;

  constructor(
    private router: Router,
  ) { }

  gotoManageEvent() {
    this.router.navigate([`/manage_event/${this.event?._id}`])
  }

  reloadComponent() {
    let currentUrl = this.router.url;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
  }

  async gotoDeleteEvent() {

    if (confirm('Are you sure you want to delete this event?')) {
      
      //then do the post to API deleteEvent
      const response = await fetch(`${environment.API_URL}/admin-api/delete-event/${this.event?._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(rsp => rsp.json())
      .catch((err) => console.log(err))

      if (response.status === "success") {
        window.alert('Event Deleted');
        this.reloadComponent();
      }
    }

  }

    

  ngOnInit(): void {
    this.PresentationName = this.event?.name;
    if (this.PresentationName.length > 11) {
      this.PresentationName = this.PresentationName.substring(0, 10) + "...";;
    }


  }

}
