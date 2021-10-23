import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-site-visit',
  templateUrl: './site-visit.component.html',
  styleUrls: ['./site-visit.component.css']
})
export class SiteVisitComponent implements OnInit {
  @Input() visit: any;
  @Output() returnToAttempts = new EventEmitter<Boolean>();

  visitPoints = 0;
  rejected = false;
  closeupImg: string | void = "";
  teamImg: string | void = "";

  constructor() { }

  async getImage(type: string, img_path: string) : Promise<string | void>{
    const response = await fetch(`${environment.API_URL}/client-api/images/${type}/${ img_path.split(".")[0] }`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
	    return response.response;
    }
  }

  getVisitImages() {
    // get team closeup image
    this.getImage("thumbnail", this.visit.answers_given.closeup)
    .then(rsp => {
      if (rsp !== null) {
        this.closeupImg = rsp;
      }
    })

    // get team image
    this.getImage("saved", this.visit.team_img)
    .then(rsp => {
      if (rsp !== null) {
        this.teamImg = rsp;
      }
    })
  }  

  calculatePoints() {
    let pointsKeys = this.visit.points_earned;

    // if site ammount is 0, attempt was rejected so only negative points given
    if (pointsKeys['site_amt'] == 0) {
      this.rejected = true;
      Object.keys(pointsKeys).forEach(key => {
        if (pointsKeys[key] < 0) {
          this.visitPoints += pointsKeys[key];
        }
      });
    } 
    else {
      Object.keys(pointsKeys).forEach(key => {
        this.visitPoints += pointsKeys[key];
      });
    }

    this.visitPoints = Math.round(this.visitPoints);
  }


  ngOnInit(): void {
    this.getVisitImages();
    this.calculatePoints();
  }
}
