import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    public jwtHelper: JwtHelperService
  ) { }

  public authenticated() : boolean {
    const token = localStorage.getItem("token") || "";
    return !this.jwtHelper.isTokenExpired(token);
  }
}
