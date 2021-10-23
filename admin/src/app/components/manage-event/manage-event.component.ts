import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

enum MenuOption {
  None = "",
  Map = "Event Map",
  Review = "Review Attempts",
  Teams = "Teams",
  Communications = "Communications",
  Statistics = "Statistics",
  Sites = "Sites",
  Edit = "Edit Event",
}

@Component({
  selector: 'app-manage-event',
  templateUrl: './manage-event.component.html',
  styleUrls: ['./manage-event.component.css']
})
export class ManageEventComponent implements OnInit {
  eventId: number;
  selected: MenuOption = MenuOption.None;

  // Header Variables
  adminName: String = "null";
  date: Date = new Date();
  eventTitle: String = "null";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { 
    const routeParams = this.route.snapshot.paramMap;
    this.eventId = Number(routeParams.get('eventId'));
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
      //console.log(response.response);
      this.eventTitle = response.response.name;
    }
  }

  loadUser() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    this.adminName = payload.username;
  }

  /* Menu options */
  // expose enum to html
  get menuOption(): typeof MenuOption {
    return MenuOption;
  }

  gotoEventSelect() {
    this.router.navigate(["events"]);
    // may need to remove some localstorage contents here pertaining to current event
  }
  
  async logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/login"]);
  }

  getEventID() {
	this.eventId = Number(location.pathname.split('/')[2])
  }

  // initialise functions
  ngOnInit(): void {
	this.getEventID();
    this.initialiseEventInfo();
    this.loadUser();
  }
}
