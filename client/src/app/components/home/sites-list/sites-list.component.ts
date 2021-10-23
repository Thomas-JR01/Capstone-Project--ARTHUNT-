import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sites-list',
  templateUrl: './sites-list.component.html',
  styleUrls: ['./sites-list.component.css']
})
export class SitesListComponent implements OnInit {
  eventId: Number = -1;
  siteList: Array<{active: boolean, growth_factor: number, site_number: Number, total_points: number, locked: boolean}> = [];
  tett: any;

  sitesForm = this.formBuilder.group({})

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { }

  async getSites() {
    const response = await fetch(`${environment.API_URL}/client-api/sites/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.siteList = response.response;

      for (let i = 0; i < this.siteList.length; i++) {
        this.siteList[i].total_points = Math.round(this.siteList[i].total_points);
        this.siteList[i].growth_factor = Math.round(this.siteList[i].growth_factor * 100) / 100;
      }
    }
  }

  sortBy_Sites() {
    //Default - Sort By Sites (Acescending)
    let temp_siteList : Array<{active: boolean, growth_factor: Number, site_number: Number, total_points: Number}> = this.siteList;
    temp_siteList.sort(function (a, b) {
      return a.site_number.valueOf() - b.site_number.valueOf();
    });

    this.router.navigate([`/siteslist`]);
    //console.log("Site Sort");
  }

  sortBy_Points() {
    this.sortBy_Sites(); //Reset

    //Sort By Points (Descending)
    let temp_siteList : Array<{active: boolean, growth_factor: Number, site_number: Number, total_points: Number}> = this.siteList;
    temp_siteList.sort(function (a, b) {
      return a.total_points.valueOf() - b.total_points.valueOf();
    }); temp_siteList.reverse();

    //Sort The sites in correct order
    temp_siteList.sort(function (a, b) {
      return a.total_points.valueOf() - b.total_points.valueOf();
    }); temp_siteList.reverse();
    
    this.router.navigate([`/siteslist`]);
    //console.log("Point Sort");
  }

  sortBy_GrowthRate() {
    this.sortBy_Sites(); //Reset

    //Sort By Growth Rate (Descending)
    let temp_siteList : Array<{active: boolean, growth_factor: Number, site_number: Number, total_points: Number}> = this.siteList;
    temp_siteList.sort(function (a, b) {
      return a.growth_factor.valueOf() - b.growth_factor.valueOf();
    }); temp_siteList.reverse();

    //Sort The sites in correct order
    temp_siteList.sort(function (a, b) {
      return a.growth_factor.valueOf() - b.growth_factor.valueOf();
    }); temp_siteList.reverse();

    this.router.navigate([`/siteslist`]);
    //console.log("Growth Rate Sort");
  }

  getEventID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    this.eventId = payload.eventID;
  }

  ngOnInit(): void {
    this.getEventID();
    this.getSites();
  }
}
