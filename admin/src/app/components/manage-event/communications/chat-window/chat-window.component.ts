import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  @Input() recipient: any;
  @Input() messages: any;

  constructor(
    private route: ActivatedRoute
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async getTeamName(teamID: number) {
	  const response = await fetch(`${environment.API_URL}/client-api/id-to-name/team/${teamID}`, {
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

  parseDate(date: Date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let meridiem = hour < 12 ? "am" : "pm";

    hour = hour % 12 === 0 ? 12 : hour % 12; // format hours to 12 hour time

    const twelveHourTime = (hour).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + " " + meridiem;

    return twelveHourTime;
  }

  async parseTimestamps() {
    this.messages.forEach(async (message:any) => {
      message.time = this.parseDate(new Date(message.timestamp));
    });
  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    this.parseTimestamps(); // parse timestamps everytime @Input messages changes
  }
}
