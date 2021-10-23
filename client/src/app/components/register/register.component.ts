import { _isNumberValue } from '@angular/cdk/coercion';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AddMemberComponent } from './add-member/add-member.component';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

import {sha256, sha224} from 'js-sha256';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  eventId: Number;
  members: Array<{username: string, virtual: boolean}> = [];
  noMembers: boolean = true;
  registerError: boolean = false;
  errorMessage: string = "error";

  // shared data with dialog component
  username: string = "";
  virtual: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private auth: AuthService
    ) {
    const routeParams = this.route.snapshot.paramMap;
    this.eventId = Number(routeParams.get('eventId'));
  }

  registerForm = this.formBuilder.group({
    teamName: '',
    pin: '',
    contact: '',
    members: []
  })

  addMember() : void{
    if(this.members.length + 1 > 6) {
      window.alert("No more members can be added.")
      return;
    }

    let dialogRef = this.dialog.open(AddMemberComponent, {
      data: {username: this.username, virtual: this.virtual}
    });

    dialogRef.afterClosed().subscribe(result=> {
      if (result) {
        if (result.username && !this.members.find(member => member.username == result.username)) {
          this.noMembers = false;
          this.members.push({username: result.username, virtual: (result.virtual === "true")});
          this.registerForm.controls['members'].setValue(this.members);
        }
        else {
          window.alert("New member must have a unique name that is not empty.")
        }
      }
    });
  }

  removeMember(removeMember:{username: string, virtual: boolean}) {
    this.members = this.members.filter(member => member != removeMember);
    this.noMembers = this.members.length < 1;
    this.registerForm.controls['members'].setValue(this.members);
  }

  async register() {
    console.warn('Attempted Register', this.registerForm.value);

    const teamName = String(this.registerForm.get('teamName')?.value);
    const pin = this.registerForm.get('pin')?.value;
	  const hash = sha256.hex(pin);
    const contact = this.registerForm.get('contact')?.value;

    // valid format check
    if (!teamName) {
      window.alert("Team name must not be empty!");
      return;
    }
    else if (isNaN(pin) || String(pin).length != 4) {
      window.alert("Team pin must be a 4 digit number!");
      return;
    }
    else if (!contact || isNaN(contact)) {
      window.alert("Please enter a contact number in case of emergency!");
      return;
    }
    else if (this.members.length < 2) {
      window.alert("Team must have at least two members!");
      return;
    }

    const response = await fetch(`${environment.API_URL}/client-api/register/${this.eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        'team_name': teamName,
        'pin': hash,
        'contact': contact,
        'participants': this.members
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      // display team members
      window.alert(`Successfully created team, welcome to ArtHunt ${teamName}`)
      this.router.navigate([`/login/${this.eventId}`])
    }
    else if (response.status === "error") {
      this.registerError = true;
      this.errorMessage = response.message;
    }
    //console.log(response);
  }

  ngOnInit(): void {
    if (this.auth.authenticated()) {
      this.router.navigate(['']);
    }
  }
}
