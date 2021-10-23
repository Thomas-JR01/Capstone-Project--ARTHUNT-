import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  eventList: Array<{_id: Number, name: String, city: String, active: Boolean}> = [];

  eventsForm = this.formBuilder.group({})

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) { }

  gotoCreateEvent() {
    this.router.navigate([`/create_event`])
  }

  gotoSiteInfo() {
    this.router.navigate([`/site_info`]);
  }

  gotoCreateAdmin() {
    this.router.navigate([`/create_admin`])
  }

  async logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/login"]);
  }

  async getEvent() {

    const response = await fetch(`${environment.API_URL}/admin-api/list-events/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.eventList = response.response;
    }
  }



  ngOnInit(): void {
    this.getEvent();
  }

}