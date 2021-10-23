import { Component, Input, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent implements OnInit {
  @Input() messages: any;

  constructor(private jwtHelper: JwtHelperService) { }

  ngOnInit(): void {

  }

  getTeamID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.teamID;
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
}
