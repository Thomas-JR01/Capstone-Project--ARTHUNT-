import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-event-site-info',
  templateUrl: './event-site-info.component.html',
  styleUrls: ['./event-site-info.component.css']
})
export class EventSiteInfoComponent implements OnInit, AfterViewInit {
  loading = true;
  siteList: Array<{
    site_id: {$oid: String},
    site_number: Number,
    active: Boolean,
    total_points: Number,
    growth_factor: Number,
    locked: Boolean
  }> = [];

  siteList_Extra: Array<{
    _id: {$oid: String},
    location: String,
    main_img: String,
    abstract_img: String,
    closeup: String,
    title: String,
    artist: String,
    year: Number,
    active: Boolean,
    theme: String,
    lat: Number,
    long: Number,
    information: String,
    type: String,
    clue: String,
    notes: String}> = [];


  constructor(
    private route: ActivatedRoute,
    private jwtHelper: JwtHelperService
  ) { }
  
  ngAfterViewInit(): void {
    this.loading = false;
  }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async getEventSites() {
    const response = await fetch(`${environment.API_URL}/admin-api/event-sites/${this.getEventID()}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))
    //console.log(response);

    if (response.status === "success") {
      this.siteList = response.response;

      for (let i = 0; i < response.response.length; i++){
        this.siteList[i].total_points = Math.round(response.response[i].total_points);
        this.siteList[i].growth_factor = Math.round(response.response[i].growth_factor * 100) / 100;
      }
    }
  }

  async getSites() {
    const response = await fetch(`${environment.API_URL}/admin-api/site-templates/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.siteList_Extra = response.response;

    }
  }

  ngOnInit(): void {
    this.getSites();
    this.getEventSites();
  }
}
