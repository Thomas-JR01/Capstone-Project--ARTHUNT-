import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-site-history',
  templateUrl: './site-history.component.html',
  styleUrls: ['./site-history.component.css']
})
export class SiteHistoryComponent implements OnInit {
  visits: any;
  visit: any;
  visitSelected = false;

  constructor(
    private route: ActivatedRoute,
    private jwtHelper: JwtHelperService
  ) { }

  getEventID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.eventID;
  }

  parseDate(date: Date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let meridiem = hour < 12 ? "am" : "pm";

    hour = hour % 12 === 0 ? 12 : hour % 12; // format hours to 12 hour time

    const twelveHourTime = (hour).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + " " + meridiem;

    return twelveHourTime;
  }

  // fetch site visits for team
  async getVisits() {
    const response = await fetch(`${environment.API_URL}/client-api/site-visits`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    //console.log(response)
    // sort attempts by time
    this.visits = response.response.sort((attempt1: any, attempt2: any) => {
      const time1 = attempt1.timestamp;
      const time2 = attempt2.timestamp;

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

    this.visits.map((visit: any) => {
      visit.timestamp = this.parseDate(new Date(visit.timestamp));
      
      // round points
      for (let key in visit.points_earned) {
        visit.points_earned[key] = Math.round(visit.points_earned[key]);
      };
    })
  }

  displayVisit(visit: any) {
    this.visit = visit;
    this.visitSelected = true;
  }

  returned() {
    this.visitSelected = false;
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.getVisits();
  }

}
