import { Component, OnInit, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-strategy-item',
  templateUrl: './strategy-item.component.html',
  styleUrls: ['./strategy-item.component.css']
})
export class StrategyItemComponent implements OnInit {

  @Input() StrategyInfo : any; //{name: String, description: String, team_gains: [{team_id: Number, points_gain: Number}]} | undefined

  Team_Strategy_Rank: Number = 0;
  Team_Rank_Display: String = "";
  Team_Points_Display: String = "";
  Button_Text: String = "Interact";

  EnrolledInStrategy: boolean = false;


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

  CheckDisplayData(){
    this.Team_Rank_Display = "";
    this.EnrolledInStrategy = false;
    this.Button_Text = "Enroll"
    for (let i = 0; i < this.StrategyInfo.team_gains.length; i++) {
      if (this.getTeamID() == this.StrategyInfo.team_gains[i].team_id) {
        this.EnrolledInStrategy = true;
        this.Team_Strategy_Rank = i+1;
        this.Team_Rank_Display = "Your team is ranked #" + this.Team_Strategy_Rank + " in the " + this.StrategyInfo.name + " strategy.";
        this.Team_Points_Display = "Point Gain: " + this.StrategyInfo.team_gains[i].points_gain;
        this.Button_Text = "Unenroll"
        break;
      }
    }
  }

  async Leave(){
    const response = await fetch(`${environment.API_URL}/client-api/leave-strategy/`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))
    if (response.status === "success") {
      //console.log(response.status);
    }
  }

  async Join(){
    const response = await fetch(`${environment.API_URL}/client-api/join-strategy/${this.StrategyInfo.name}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))
    if (response.status === "success") {
      //console.log(response.status);
    }
  }

  reloadComponent() {
    let currentUrl = this.router.url;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl]);
    }

  interactOnClick(){
    this.CheckDisplayData();
    if (this.EnrolledInStrategy){
      //console.log("Running... (this.EnrolledInStrategy) = true");
      this.Leave();
    } else {
      //console.log("Running... (this.EnrolledInStrategy) = false");
      this.Join();
    }
    this.reloadComponent();
  }

  ngOnInit(): void {
    this.CheckDisplayData();
    //console.log(this.StrategyInfo);
  }

}
