import { Component, OnInit, OnChanges, EventEmitter, Output} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-review-attempts',
  templateUrl: './review-attempts.component.html',
  styleUrls: ['./review-attempts.component.css']
})
export class ReviewAttemptsComponent implements OnInit {
  attempts: any = []
  attemptSelected = false;
  attempt: any;
  interval: any;

  constructor(
    private route: ActivatedRoute
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  parseDate(date: Date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let meridiem = hour < 12 ? "am" : "pm";

    hour = hour % 12 === 0 ? 12 : hour % 12; // format hours to 12 hour time

    const twelveHourTime = (hour).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + " " + meridiem;

    return twelveHourTime;
  }

  parseAndSortAttempts() {
    this.attempts.sort((attempt1: any, attempt2: any) => {
      const time1 = attempt1.timestamp;
      const time2 = attempt2.timestamp;

      // sort by time and marked status
      if (attempt1.marked && !attempt2.marked) {
        return 1;
      } 
      else if (!attempt1.marked && attempt2.marked) {
        return -1;
      }
      else {
        if (time1 > time2) {
          return -1;
        }
        else if (time2 < time1) {
          return 1;
        }
        else return 0; 
      }
    })

    // parse dates and round points
    this.attempts.map((attempt: any) => {
      attempt.timestamp = this.parseDate(new Date(attempt.timestamp));
      
      for (let key in attempt.points_earned) {
        attempt.points_earned[key] = Math.round(attempt.points_earned[key]);
      };
    })
  }

  async getSiteAttempts(eventID: number) {
    const response = await fetch(`${environment.API_URL}/admin-api/site-attempts/${eventID}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))
    
    if (response.status === "success") {
      // sort attempts by time
      this.attempts = response.response;
      this.parseAndSortAttempts();
      this.subscribeAttempts();
    }
  }

  async subscribeAttempts() {
    let response = await fetch(`${environment.API_URL}/admin-api/subscribe-attempts/${this.getEventID()}`, {
      method: 'GET',
      headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp =>  {
      //console.log(rsp)
      return rsp.json()
    })
    .then(async rsp => {
      //console.log("new data!", rsp)
      if (rsp.status === "success") {
        this.attempts = rsp.response;
        this.parseAndSortAttempts();
        await this.subscribeAttempts();
      }
      else {
        // else failed, reconnect after one second
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.subscribeAttempts();
      }
    })
    .catch((err) => { console.log(err); })
  }

  async getTeamName(teamID: number) {
	  const response = await fetch(`${environment.API_URL}/client-api/id-to-name/team/${teamID}/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json"
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      return response.response;
    }
  }

  markAttempt(attempt: any) {
    this.attempt = attempt;
    this.attemptSelected = true;
  }

  // function called by child component mark-attempt when returning
  returned() {
    this.attemptSelected = false;
    this.ngOnInit();
  }

  updateAttempts() {
    this.interval = setInterval(() => this.getSiteAttempts(this.getEventID()),1000)
  }

  ngOnInit(): void {
    this.getSiteAttempts(this.getEventID());
  }
}
