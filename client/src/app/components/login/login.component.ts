import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

import {sha256, sha224} from 'js-sha256';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  eventName: string = 'Event'
  teamName: string = '';
  teamID: Number = 0;
  members: Array<{username: string, virtual: boolean}> = [];
  verified: boolean = false;
  invalid: boolean = false;
  nameErrorText: string = "Team name may be invalid";
  pinErrorText: string = "Pin may be invalid";

  loginForm = this.formBuilder.group({
    teamName: '',
    pin: ''
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private auth: AuthService
    ) {
  }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  gotoRegister() {
    this.router.navigate([`/register/${this.getEventID()}`])
  }

  async verify() {
    //console.warn('Attempted Login', this.loginForm.value);
    this.teamName = String(this.loginForm.get('teamName')?.value);
    const pin = this.loginForm.get('pin')?.value;
	  const hash = sha256.hex(pin);

    const response = await fetch(`${environment.API_URL}/client-api/login/team/${this.getEventID()}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        'team_name': this.teamName,
        'pin': hash
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    //console.log(response);

    if (response.status === "success") {
      // display team members
      this.members = response.response.members;
      this.teamID = response.response.team_id;
      this.verified = true;
    } 
    else if (response.status === "error"){
      this.invalid = true;
    }
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
    }
    else {
      return "Event"
    }
  }

  async initialiseLogin() {
    this.eventName = await this.getEventName();
  }

  ngOnInit(): void {
    if (this.auth.authenticated()) {
      this.router.navigate(['']);
    }
    this.initialiseLogin();
  }
}
