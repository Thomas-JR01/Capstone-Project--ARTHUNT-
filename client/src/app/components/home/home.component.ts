import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TransferPointsComponent } from './transfer-points/transfer-points.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  teamName: string = "Team name"
  points: number = 0;
  strategySelected = "None";
  eventInactive: boolean = false;
  retryTime: number = 15;
  loading = true;

  // transfer points
  teams: Array<{_id: number, name: string, points: number}> = []
  recipient: {name: string, points: number} = {name: "", points: 0};
  teamPoints: number = 0;
  pointsToTransfer: number = 0;

  // Timers
  timeLeft: number = 1;
  recoveryDuration: number = 1;

  // Interval updaters
  interval: any;
  syncInterval: any;
  updateTeamInfoInterval: any;
  eventCheckInterval: any;

  constructor(
    private router: Router,
    private jwtHelper: JwtHelperService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) { }

  logout() {
    const eventID = this.getEventID();
    localStorage.removeItem("token");
    this.router.navigate([`login/${eventID}`]);
  }

  gotoContacts() {
    this.router.navigate([`/contacts`]);
  }

  gotoSitesList() {
    this.router.navigate([`/siteslist`]);
  }

  gotoLeaderboard() {
    this.router.navigate([`/leaderboard`]);
  }

  gotoInstructions() {
    this.router.navigate([`/instructions`]);
  }

  gotoHistory() {
    this.router.navigate([`/site-history`]);
  }

  gotoStrategies() {
    this.router.navigate([`/strategies`]);
  }

  gotoMap() {
    this.router.navigate([`/map`]);
  }

  gotoChat() {
	this.router.navigate([`/messages`]);
  }

  /********** transfer points button **********/
  transferPointsForm = this.formBuilder.group({

  })

  getTeamID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.teamID;
  }

  getEventID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.eventID;
  }

  async getTeamData() {
    const response = await fetch(`${environment.API_URL}/client-api/team-details`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      return response.response;
    } else {
      return -1;
    }
  }

    // initialise team info for home screen
    async initialiseTeamInfo() {
      const teamData = await this.getTeamData();
      if (teamData !== -1) {
        this.teamName = teamData.name;
        this.points = Math.round(teamData.points);
        this.strategySelected = teamData.strategy_selected;

        // update team info
        if (this.updateTeamInfoInterval === undefined) {
          this.updateTeamInfoInterval = setInterval(() => {
            this.initialiseTeamInfo();
          },60*1000)
        }
      }
    }
  

  // Transfer points
  async getTeams() {
    const response = await fetch(`${environment.API_URL}/client-api/leaderboard`, {
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
      this.teamPoints = this.teams.find(team => team._id === this.getTeamID())?.points || 0;
      this.teams = this.teams.filter(team => team._id !== this.getTeamID());
      //Rank Teams & Move Into `entryList`
      this.teams.sort(function(a, b){
        return b.points - a.points;
      });

      this.teams.map((team) => {
        team.points = Math.round(team.points);
      })
    }
  }

  async transferPoints() {
    await this.getTeams();
    let dialogRef = this.dialog.open(TransferPointsComponent, {
      data: {teams: this.teams, recipient: this.recipient, pointsToTransfer: this.pointsToTransfer}
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.recipient = result.recipient;
        this.pointsToTransfer = result.pointsToTransfer;
        //console.log("recipient:", this.recipient, "points to transfer:", this.pointsToTransfer)

        // validate input (valid points transfer and has enough points)
        if (this.teamPoints - this.pointsToTransfer < 0) {
          window.alert("Your team does not have that many points!");
          return;
        }
        else {
          // api call to transfer points
          const response = fetch(`${environment.API_URL}/client-api/points/transfer/${this.recipient.name}/${this.pointsToTransfer}`, {
            method: 'POST',
            headers: {
              'Content-Type': "application/json",
              'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
          })
          .then(rsp => rsp.json())
          .then(rsp => {
            if (rsp.status === "success") {
              window.alert(`${this.pointsToTransfer} points transferred to team ${this.recipient.name}!`);
            }
          })
          .catch((err) => console.log(err))
        }
      }
    });
  }

  /********** transfer points button END **********/

  async getEventTimeLeft() {
    const response = await fetch(`${environment.API_URL}/client-api/event-time`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      return response.response
    } else {
      return -1;
    }
  }

  async setEventInfo() {
    const eventInfo = await this.getEventTimeLeft();
    if (eventInfo !== -1) {
      // server is responding
      this.eventInactive = false;
      clearInterval(this.eventCheckInterval);
      this.eventCheckInterval = undefined;

      this.timeLeft = eventInfo.game_timer;
      this.recoveryDuration = eventInfo.settings.reset_duration;
    } else {
      // event is inactive or the server is having issues
      this.eventInactive = true;

      // check server every minute
      if (this.eventCheckInterval === undefined) {
        this.eventCheckInterval = setInterval(() => {
          this.retryTime--;

          if (this.retryTime <= 0) {
            this.retryTime = 15;
            this.ngOnInit();
          }
        }, 1*1000)
      }
    }
  }

  eventTimeLeft() {
    let gameTime = new Date(this.timeLeft * 1000);
    return gameTime.toISOString().substr(11, 8);
  }

  siteRecoveryTimer() {
    let gameTime = new Date((this.timeLeft % this.recoveryDuration) * 1000);
    return gameTime.toISOString().substr(14, 5);
  }

  startTimer() {
    if (this.interval === undefined) {
      this.interval = setInterval(() => {
        this.timeLeft--;
      }, 1000)
    }

    // sync timers every 5 minutes
    if (this.syncInterval === undefined) {
      this.syncInterval = setInterval(() => {
        this.setEventInfo();
      },5*60*1000)
    }
  }

  stopUpdates() {
    // clear all timers
    clearInterval(this.interval);
    clearInterval(this.syncInterval);
    clearInterval(this.updateTeamInfoInterval);
    clearInterval(this.eventCheckInterval);
    this.interval = undefined;
    this.syncInterval = undefined;
    this.updateTeamInfoInterval = undefined;
    this.eventCheckInterval = undefined;
  }

  ngOnInit(): void {
    this.initialiseTeamInfo();
    this.setEventInfo();
    this.startTimer();
    this.loading = false;
  }

  ngOnDestroy(): void {
    this.stopUpdates();
  }
}
