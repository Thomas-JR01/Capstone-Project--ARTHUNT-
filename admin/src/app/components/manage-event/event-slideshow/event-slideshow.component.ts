import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-event-slideshow',
  templateUrl: './event-slideshow.component.html',
  styleUrls: ['./event-slideshow.component.css']
})
export class EventSlideshowComponent implements OnInit {

  IMAGE_STACK_00: String | void = ""; //MAIN
  IMAGE_STACK_01: String | void = ""; //PRE-LOAD 1
  IMAGE_STACK_02: String | void = ""; //PRE-LOAD 2
  IMAGE_COUNT = 0;

  ImagesArray: Array<string> = [];

  ImageFade_Value: any; Current_Opacity = 150; inORout: Boolean = true;

  eventId: Number = 404;

  eventTitle: String = "null";
  eventLocation: String = "null";
  eventCoordinator_name: String  = "null";
  eventCoordinator_contact: String  = "null";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { 
    const routeParams = this.route.snapshot.paramMap;
    this.eventId = Number(routeParams.get('eventID'));
  }

  // Initialisation of Event Variables
  async initialiseEventInfo() {
    const response = await fetch(`${environment.API_URL}/admin-api/event-data/${this.eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.eventTitle = response.response.name;
      this.eventLocation = response.response.city;
      this.eventCoordinator_name = response.response.coordinator.name;
      this.eventCoordinator_contact = response.response.coordinator.contact;
    }
  }

  async initialiseImagesList() {
    const response = await fetch(`${environment.API_URL}/admin-api/list-images/${this.eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.ImagesArray = response.response;
      //console.log(this.ImagesArray);
    }
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
  

  fadeImage() {
    //inORout - False: Fade Image In | True: Fade Image Out

    if (this.Current_Opacity <= 30){

      this.changeImage();

      this.IMAGE_COUNT = this.IMAGE_COUNT+1;
      this.inORout = false;

    } else if(this.Current_Opacity >= 150){
      this.inORout = true;

    }


    if(this.inORout){ //Out
      this.Current_Opacity = this.Current_Opacity-3;
      this.ImageFade_Value = {'opacity': this.Current_Opacity+'%'};
    } else { //In
      this.Current_Opacity = this.Current_Opacity+3;
      this.ImageFade_Value = {'opacity': this.Current_Opacity+'%'};
    }

  }

  changeImage() {
    this.IMAGE_STACK_00 = this.IMAGE_STACK_01
    this.IMAGE_STACK_01 = this.IMAGE_STACK_02
    this.getImage("saved", this.ImagesArray[this.IMAGE_COUNT+2])
      .then(rsp => {
        if (rsp !== null) {
          this.IMAGE_STACK_02 = rsp;
        }
      });
  }

  async ProjectRun(){
    await this.initialiseEventInfo();
    await this.initialiseImagesList();

    //console.log(this.ImagesArray[0]);
    this.getImage("saved", this.ImagesArray[0])
      .then(rsp => {
        if (rsp !== null) {
          this.IMAGE_STACK_00 = rsp;
        }
      });
    
    //console.log(this.ImagesArray[1]);
    this.getImage("saved", this.ImagesArray[1])
    .then(rsp => {
      if (rsp !== null) {
        this.IMAGE_STACK_01 = rsp;
      }
    });

    //console.log(this.ImagesArray[2]);
    this.getImage("saved", this.ImagesArray[2])
    .then(rsp => {
      if (rsp !== null) {
        this.IMAGE_STACK_02 = rsp;
      }
    });

  }


  ngOnInit(): void {
    this.ProjectRun();

    setInterval(() => { this.fadeImage();}, 100);

  }

}
