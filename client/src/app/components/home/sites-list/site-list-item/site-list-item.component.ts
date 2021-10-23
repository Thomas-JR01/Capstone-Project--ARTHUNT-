import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-site-list-item',
  templateUrl: './site-list-item.component.html',
  styleUrls: ['./site-list-item.component.css']
})
export class SiteListItemComponent implements OnInit {
  @Input() site: {active: boolean, growth_factor: Number, site_number: Number, total_points: Number} | undefined;
  growthNum: Number = 0;
  GrowthLabelColor: any;
  testvar: any;


  constructor(
    private router: Router,
  ) { }

  async gotoSiteAttempt() {
    // check if locked first, if locked dont navigate and send window confirm
    const response = await fetch(`${environment.API_URL}/client-api/site-info/${this.site?.site_number}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      if (response.response.locked) {
        if (confirm(`Site ${this.site?.site_number} is locked!\nAn attempt made on this site is still being reviewed`)) {
          return;
        }
      }
      else {
        this.router.navigate([`/site-attempt/${this.site?.site_number}`]);
      }
    }
  }

  colorGrowthLabel() {
    if (this.site?.growth_factor != null) {
      this.growthNum = this.site?.growth_factor;
    }

    if (this.growthNum >= 2) {
      this.GrowthLabelColor = {
        'color': 'lightgreen'
      };
    } else {
      this.GrowthLabelColor = {
        'color':'orange'
      };
    }
  }

  openSiteAttempt() {
  }

  ngOnInit(): void {
    this.colorGrowthLabel();
  }

}
