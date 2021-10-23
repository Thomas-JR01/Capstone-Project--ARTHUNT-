import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mark-attempt',
  templateUrl: './mark-attempt.component.html',
  styleUrls: ['./mark-attempt.component.css']
})
export class MarkAttemptComponent implements OnInit {
  @Input() attempt: any;
  @Output() returnToAttempts = new EventEmitter<Boolean>();

  closeupImg: string | void = "";
  closeupImgActual: string | void = "";
  teamImg: string | void = "";
  mainImg: string | void = "";

  constructor(
    private route: ActivatedRoute
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }


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

  getAttemptImages() {
    // get team closeup image
    this.getImage("thumbnail", this.attempt.answers_given.closeup)
    .then(rsp => {
      if (rsp !== null) {
        this.closeupImg = rsp;
      }
    })

    // get correct closeup image
    this.getImage("thumbnail", this.attempt.closeup)
    .then(rsp => {  
      if (rsp !== null) {
        this.closeupImgActual = rsp;
      }
    })

    // get team image
    this.getImage("saved", this.attempt.team_img)
    .then(rsp => {
      if (rsp !== null) {
        this.teamImg = rsp;
      }
    })

    // get main image of the site
    this.getImage("main", this.attempt.main_img)
    .then(rsp => {
      if (rsp !== null) {
        this.mainImg = rsp;
      }
    })
  }  

  async markSite(mark: Number) {
    const response = await fetch(`${environment.API_URL}/admin-api/approve-site/${this.getEventID()}/${this.attempt.site_num}/${mark}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
        'Authorization':  `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    // return to site list
    this.return();
  }

  return() {
    this.returnToAttempts.emit(true);
  }

  ngOnInit(): void {
    //console.log(this.attempt)
    this.getAttemptImages();
  }

}
