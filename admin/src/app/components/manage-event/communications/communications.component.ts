import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-communications',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.css']
})
export class CommunicationsComponent implements OnInit {
  recipients = ["All"];
  recipientSelected = false;
  messages: any;
  recipient = "";

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) { }

  // send message
  messageForm = this.formBuilder.group({
    message: ''
  })

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
    //console.log(response)

    if (response.status === "success") {
      response.response.forEach((team: any) => {
        this.recipients.push(team.name);
      });
    }
  }

  async loadMessages(recipient:any) {
    const response = await fetch(`${environment.API_URL}/admin-api/messages/${this.getEventID()}/${recipient}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .then(rsp => {
      if (rsp.status === "success") {
        this.recipient = recipient;
        this.messages = rsp.response;
        this.recipientSelected = true;
        //console.log("testing")
        this.subscribeMessages(recipient);
      }
    })
    .catch((err) => console.log(err))
  }

  async subscribeMessages(recipient: string) {
    let subscribeResponse = await fetch(`${environment.API_URL}/admin-api/subscribe-messages/${this.getEventID()}/${recipient}`, {
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
        this.messages = rsp.response;
        await this.subscribeMessages(recipient);
      }
      else {
        // else failed, reconnect after one second
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.subscribeMessages(recipient);
      }
    })
    .catch((err) => { console.log(err); })
  }

  async sendMessage() {
    const message = String(this.messageForm.get('message')?.value);
    
    // api call
	  const response = await fetch(`${environment.API_URL}/admin-api/send-message/${this.getEventID()}/${this.recipient}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        'message' : message
      })
    })
    .then(rsp => rsp.json())
    .then(rsp => {
      if (rsp.status === "success") {
        this.messageForm.reset();
      }
    })
    .catch((err) => console.log(err))
  }

  ngOnInit(): void {
    this.getTeams();
  }

}
