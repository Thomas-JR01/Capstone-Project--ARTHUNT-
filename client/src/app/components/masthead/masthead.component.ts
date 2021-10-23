import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-masthead',
  templateUrl: './masthead.component.html',
  styleUrls: ['./masthead.component.css']
})
export class MastheadComponent implements OnInit {
  eventName: string = "Event";

  constructor(
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { }

  gotoNotifications() {
    // TODO
    // Notification component system for messages, game alerts
    // this should be long polled, and display a red icon with a number to indicate unacknowledged notfications
  }

  home() {
    this.router.navigate([''])
  }

  getEventID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.eventID;
  }

  async getEventName() {
	  const response = await fetch(`${environment.API_URL}/client-api/id-to-name/event/${this.getEventID()}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      return response.response;
    } else {
      return response.message;
    }
  }

  async initaliseHome() {
    this.eventName = await this.getEventName();
  }

  ngOnInit(): void {
    this.initaliseHome();
  }
}
