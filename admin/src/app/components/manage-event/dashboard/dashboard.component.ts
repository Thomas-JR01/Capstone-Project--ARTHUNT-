import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivationEnd } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

enum EventState {
  Active = "active",
  Paused = "paused"
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() eventID: number | undefined;

  // Status
  eventStatus: String = "(Status)"

  // Event Info
  eventTitle: String = "null";
  eventLocation: String = "null";
  eventTeamsNo: number = 0;
  eventParticipants: number = 0;
  eventCoordinator: string = "Unknown";

  // Timers
  timeLeft: number = 1;
  recoveryDuration: number = 1;
  roundDuration: number = 1;

  // Interval Updaters
  interval: any;
  syncInterval: any;

  constructor(
    private route: ActivatedRoute
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async getEventDashInfo() {
    const response = await fetch(`${environment.API_URL}/admin-api/event-data/${this.eventID}`, {
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
    const eventInfo = await this.getEventDashInfo();
    this.timeLeft = eventInfo.game_timer;
    this.recoveryDuration = eventInfo.settings.reset_duration;
    this.roundDuration = eventInfo.settings.round_duration;
    this.eventTitle = eventInfo.name;
    this.eventLocation = eventInfo.city;
    this.eventTeamsNo = eventInfo.team_count;
    this.eventParticipants = eventInfo.participant_count;
    this.eventStatus = eventInfo.state;
    this.eventCoordinator = eventInfo.coordinator.name;

    if (this.eventStatus === this.eventStateOption.Active) {
      this.startTimer();
    }
  }

  eventTimeleft() {
    let gameTime = new Date(this.timeLeft * 1000);
    return gameTime.toISOString().substr(11, 8);
  }

  siteRecoveryTimer() {
    let gameTime = new Date((this.timeLeft % this.recoveryDuration) * 1000);
    return gameTime.toISOString().substr(14, 5);
  }
  
  roundTimer() {
    let gameTime = new Date((this.timeLeft % this.roundDuration) * 1000);
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

  async setEventState(state: EventState) {

    if (confirm('Are you sure you want to perform this action?')) {
      const response = await fetch(`${environment.API_URL}/admin-api/set-event-state/${this.eventID}`, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        event_state: state
      })
        })
        .then(rsp => rsp.json())
        .catch((err) => console.log(err))

      if (response.status === "success") {
        this.setEventInfo();      // update dashboard
        this.eventStatus = state;

        if (this.eventStatus === this.eventStateOption.Paused) {
          this.pauseTimer();
        }
        else {
          this.startTimer();
        }
      }
    }
  }

  // expose enum to html
  get eventStateOption(): typeof EventState {
    return EventState;
  }

  pauseTimer() {
    clearInterval(this.interval);
    clearInterval(this.syncInterval);
    this.interval = undefined;
    this.syncInterval = undefined;
  }

  openSlideShow(){
    window.open(`event-show/${this.getEventID()}`);
  }

  openQRCode(){
    window.open(`event-qr/${this.getEventID()}`);
  }

  ngOnInit(): void {
	  this.getEventID();
    this.setEventInfo();
  }

  ngOnDestroy(): void {
    this.pauseTimer();  // stop timers if dashboard is destroyed
  }
}
