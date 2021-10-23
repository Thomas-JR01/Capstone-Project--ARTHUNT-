import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: Array<{name: string, points: number, members: Array<{username: string, virtual: boolean}>, strategy_selected: string, contact: string, rank: number}> = [];

  constructor(
    private route: ActivatedRoute,
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async getTeams() {
    const response = await fetch(`${environment.API_URL}/admin-api/team-details/${this.getEventID()}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.teams = response.response;
      //Rank Teams & Move Into `entryList`
      this.teams.sort(function(a, b){
        return b.points - a.points;
      });

      for (let i = 0; i < this.teams.length; i++) {
        this.teams[i].rank = i + 1;
        this.teams[i].points = Math.round(this.teams[i].points);
      }
    }
    //console.log(response)
  }
  
  ngOnInit(): void {
    this.getTeams();
  }
}
