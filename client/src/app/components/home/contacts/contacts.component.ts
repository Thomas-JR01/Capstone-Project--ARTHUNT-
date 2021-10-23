import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  eventId: Number = -1;
  eventCoordinatorName: String = "null";
  eventCoordinatorPhone: String = "null";

  constructor(
    private jwtHelper: JwtHelperService
  ) { 

  }

  async getEventContactInfo() {
    const response = await fetch(`${environment.API_URL}/client-api/coordinator/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.eventCoordinatorName = response.response.name;
      this.eventCoordinatorPhone = response.response.contact;

    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    this.eventId = payload.eventID;
    this.getEventContactInfo();
  }
}
