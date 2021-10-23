import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public jwtHelper: JwtHelperService
  ) { }

  public authenticated() : boolean {
    const token = localStorage.getItem("token") || "";
    return !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    localStorage.removeItem("token");
  }
}
