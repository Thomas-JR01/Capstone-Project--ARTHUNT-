import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {sha256, sha224} from 'js-sha256';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  invalid: boolean = false;
  nameErrorText: string = "Username may be invalid";
  pinErrorText: string = "Password may be invalid";

  loginForm = this.formBuilder.group({
    username: '',
    password: ''
  })

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) { }

  async login() {
    console.warn('Attempted Login', this.loginForm.value);

    const username = String(this.loginForm.get('username')?.value);
    const password = this.loginForm.get('password')?.value;
	  const hash = sha256.hex(password);

    const response = fetch(`${environment.API_URL}/admin-api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        'username': username,
        'password_hash': hash
      })
    })
    .then(rsp => rsp.json())
    .then (rsp => {
      //console.log(rsp)
      if(rsp.status === 'success') {
        localStorage.setItem("token", rsp.response);
        this.router.navigate(['']);
      }
      else if(rsp.status === 'error') {
        this.invalid = true;
      }
    })
    .catch((err) => console.log(err))
  }

  ngOnInit(): void {
  }

}
