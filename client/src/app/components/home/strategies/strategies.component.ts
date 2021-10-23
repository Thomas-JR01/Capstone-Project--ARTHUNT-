import { Component, OnInit, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-strategies',
  templateUrl: './strategies.component.html',
  styleUrls: ['./strategies.component.css']
})
export class StrategiesComponent implements OnInit {

  StrategyDisplay_Info : Array<{name: String, description: String, team_gains: [{team_id: Number, points_gain: Number}]}> = [];

  constructor(
    private jwtHelper: JwtHelperService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  getEventID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.eventID;
  }

  getTeamID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.teamID;
  }

  async getStrategies() {
    const response = await fetch(`${environment.API_URL}/client-api/strategies`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.StrategyDisplay_Info = response.response;
      //console.log(this.StrategyDisplay_Info);
    }
  }

  ngOnInit(): void {
    this.getStrategies();
  }

}
