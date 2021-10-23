import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { sha256 } from 'js-sha256';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.css']
})
export class CreateAdminComponent implements OnInit {

  admincreateForm = this.formBuilder.group({
    AdminType: '',
    Username: '',
    Password: '',
  })

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwtHelper: JwtHelperService,
    private formBuilder: FormBuilder
  ) { }

  async createAdmin() {
    const AdminType = String(this.admincreateForm.get('AdminType')?.value);
    const Username = String(this.admincreateForm.get('Username')?.value);
    const Password = String(this.admincreateForm.get('Password')?.value);
    const hash = sha256.hex(Password);
	
	const response = await fetch(`${environment.API_URL}/admin-api/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
		'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        'admin_name': Username,
        'admin_pass': hash,
        'admin_rank': AdminType
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    this.router.navigate([`../`]);
  }


  checkPerms() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    //console.log(payload);
    if (payload.perm == "superadmin"){
      return true;
    }else {
      return false;
    }
  }

  ngOnInit(): void {
    if (this.checkPerms()) {} else {
      window.alert('Error: Invalid Permissions.');
      this.router.navigate([`../`]);
    }
  }

}
