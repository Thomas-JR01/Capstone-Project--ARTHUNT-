import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  teamsList: any = [];
  messages: any = [];
  teamSelection: string = "";
  teamSelected: boolean = false;
  inputDisabled = false;

  SendMessageForm = this.formBuilder.group({
	'message': ''
  })

  constructor(
	private jwtHelper: JwtHelperService,
	private formBuilder: FormBuilder) {
  }

  async getTeams() {
	const teamsRequest = await fetch(`${environment.API_URL}/client-api/leaderboard/`, {
		method: 'GET',
		headers: {
		  'Content-Type': "application/json",
		  'Authorization': `Bearer ${localStorage.getItem("token")}`
		}
	})
	.then(rsp =>  rsp.json() )
	.catch((err) => { console.log(err); })

	if (teamsRequest.status === "success") {
		this.teamsList = teamsRequest.response;
		this.teamsList.reverse();
		this.teamsList.push({_id: 0, name:"Admin"});
		this.teamsList.push({_id: -this.jwtHelper.decodeToken(localStorage.getItem('token')||'').eventID, name:"All"});
		this.teamsList.reverse();
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

  async getMessages(team: string) {
	const messageRequest = await fetch(`${environment.API_URL}/client-api/messages/${team}`, {
		method: 'GET',
		headers: {
		  'Content-Type': "application/json",
		  'Authorization': `Bearer ${localStorage.getItem("token")}`
		}
	})
	.then(rsp =>  rsp.json())
	.then((rsp) => {
		if (rsp.status === "success") {
			this.teamSelection = team;
			this.messages = rsp.response.map((message: any) => {
				message.timestamp = this.parseDate(new Date(message.timestamp));
				return message;
			})
			this.teamSelected = true;
			this.subscribeMessages(team);
		}
	})
	.catch((err) => { console.log(err); })
  }

  async subscribeMessages(team: string) {
	let subscribeResponse = await fetch(`${environment.API_URL}/client-api/subscribe-messages/${team}`, {
		method: 'GET',
		headers: {
			'Cache-Control': 'no-cache',
		  	'Content-Type': "application/json",
		  	'Authorization': `Bearer ${localStorage.getItem("token")}`
		}
	})
	.then(rsp =>  {
		return rsp.json()
	})
	.then(async rsp => {
		//console.log("new data!", rsp)
		if (rsp.status === "success") {
			this.messages = rsp.response.map((message: any) => {
				message.timestamp = this.parseDate(new Date(message.timestamp));
				return message;
			})
			await this.subscribeMessages(team);
		}
		else {
			// else failed, reconnect after one second
			await new Promise(resolve => setTimeout(resolve, 1000));
			await this.subscribeMessages(team);
		}
	})
	.catch((err) => { console.log(err); })
  }

  async sendMessage() {
	this.inputDisabled = true;
	const messageRequest = await fetch(`${environment.API_URL}/client-api/send-message/${this.teamSelection}`, {
		method: 'POST',
		headers: {
		  'Content-Type': "application/json",
		  'Authorization': `Bearer ${localStorage.getItem("token")}`
		},
		body: JSON.stringify({message: this.SendMessageForm.get('message')?.value})
	})
	.then(rsp => rsp.json())
	.catch((err) => { console.log(err); })

	if (messageRequest.status === "success") {
		this.SendMessageForm.reset();
	}
	this.inputDisabled = false;
  }

  ngOnInit(): void {
	this.getTeams();
  }
}
