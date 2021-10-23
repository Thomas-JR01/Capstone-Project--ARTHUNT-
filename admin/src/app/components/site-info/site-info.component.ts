import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.css']
})
export class SiteInfoComponent implements OnInit {
  eventId: Number = -1;
  siteList: Array<{
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
      notes: String
    }> = [];

  sitesForm = this.formBuilder.group({})

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { }
  
  gotoEvents() {
    this.router.navigate([`../`]);
  }

  checkPerms() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    //console.log(payload);
    if (payload.perm == "superadmin"){
      return true;
    }else {
      return false;
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
      this.siteList = response.response;
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    this.eventId = payload.eventID;

    if (this.checkPerms()) {} else {
      window.alert('Error: Invalid Permissions.');
      this.router.navigate([`../`]);
    }

    this.getSites();
  }

}
