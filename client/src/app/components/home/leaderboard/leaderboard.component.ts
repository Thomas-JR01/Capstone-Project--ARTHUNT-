import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  eventId: Number = -1;
  entryList: Array<{rank: number, name: String, points: number}> = [];

  leaderboardForm = this.formBuilder.group({})

  constructor(
    private formBuilder: FormBuilder,
    private jwtHelper: JwtHelperService
  ) { }

  async getTeamPoints() {
    const response = await fetch(`${environment.API_URL}/client-api/leaderboard/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))
	  //console.log(response)

    if (response.status === "success") {
      this.entryList = response.response;
      //Rank Teams & Move Into `entryList`
      this.entryList.sort(function(a, b){
        return b.points - a.points;
      });

      for (let i = 0; i < this.entryList.length; i++) {
        this.entryList[i].rank = i + 1;
        this.entryList[i].points = Math.round(this.entryList[i].points);
      }
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    this.eventId = payload.eventID;
    this.getTeamPoints();
  }

}
