import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-select-member',
  templateUrl: './select-member.component.html',
  styleUrls: ['./select-member.component.css']
})
export class SelectMemberComponent {
  @Input() members: Array<{username: string, virtual: boolean}> | undefined;
  @Input() teamID: Number | undefined;
  @Input() teamName: string | undefined;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async login(member: any) {
    const response = await fetch(`${environment.API_URL}/client-api/login/user/${this.getEventID()}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        'username': member.username,
        'virtual': member.virtual,
        'team_id': this.teamID,
        'team_name': this.teamName
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      // jwt token received, store
      localStorage.setItem("token", response.response);
      this.router.navigate(['']);
    }
  }
}
