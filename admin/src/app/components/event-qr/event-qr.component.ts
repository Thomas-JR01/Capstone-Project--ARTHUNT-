import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-event-qr',
  templateUrl: './event-qr.component.html',
  styleUrls: ['./event-qr.component.css']
})
export class EventQrComponent implements OnInit {

  eventId: Number = 404;

  input_string = "";
  google_chart_api_url = "";

  eventTitle: String = "null";
  eventLocation: String = "null";
  eventCoordinator_name: String  = "null";
  eventCoordinator_contact: String  = "null";

  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { 
    const routeParams = this.route.snapshot.paramMap;
    this.eventId = Number(routeParams.get('eventID'));
  }

  // initialisation of event variables
  async initialiseEventInfo() {

    const response = await fetch(`${environment.API_URL}/admin-api/event-data/${this.eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.eventTitle = response.response.name;
      this.eventLocation = response.response.city;
      this.eventCoordinator_name = response.response.coordinator.name;
      this.eventCoordinator_contact = response.response.coordinator.contact;
    }
  }

  ngOnInit(): void {
    this.initialiseEventInfo();
    this.input_string = `${environment.CLIENT_IP}/login/${this.eventId}`;
    this.google_chart_api_url = "https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=" + this.input_string + "&choe=UTF-8";
  }

}
