import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-event-site-info-item',
  templateUrl: './event-site-info-item.component.html',
  styleUrls: ['./event-site-info-item.component.css']
})
export class EventSiteInfoItemComponent implements OnInit {

  IMAGE_main_img: String | void = "";
  panelOpenState: Boolean = false;

  @Input() site_Array: Array<{
    _id: {$oid: String},
    location: String,
    main_img: String,
    closeup: String,
    title: String,
    artist: String,
    year: Number,
    active: Boolean,
    theme: String,
    lat: Number,
    long: Number,
    information: String,
    type: String,
    clue: String,
    notes: String}> = [];

  @Input() CurrentSiteInfo: {
    site_id: {$oid: String},
    site_number: Number,
    active: Boolean,
    total_points: Number,
    growth_factor: Number,
    locked: Boolean
  } | undefined;

  CurrentSiteInfo_Template: {
    _id: {$oid: String},
    location: String,
    main_img: any,
    closeup: String,
    title: String,
    artist: String,
    year: Number,
    active: Boolean,
    theme: String,
    lat: Number,
    long: Number,
    information: String,
    type: String,
    clue: String,
    notes: String} | undefined;

  eventSiteForm = this.formBuilder.group({
    active: false,
    locked: false,
    points: 0,
    growth: 0,
  });

  


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) { }

  getEventID() {
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async populateForm(){

    this.eventSiteForm = this.formBuilder.group({
      active: this.CurrentSiteInfo?.active,
      locked: this.CurrentSiteInfo?.locked,
      points: this.CurrentSiteInfo?.total_points,
      growth: this.CurrentSiteInfo?.growth_factor,
    });

    this.getImage("main", this.CurrentSiteInfo_Template?.main_img)
        .then(rsp => {
          if (rsp !== null) {this.IMAGE_main_img = rsp;}
        })

  }

  async updateSite(){

    const Site_active = this.eventSiteForm.get('active')?.value;
    const Site_locked = this.eventSiteForm.get('locked')?.value;
    const Site_total_points = this.eventSiteForm.get('points')?.value;
    const Site_growth_factor = this.eventSiteForm.get('growth')?.value;

    const response = await fetch(`${environment.API_URL}/admin-api/update-event-site/${this.getEventID()}/${this.CurrentSiteInfo?.site_number}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        'active': Site_active, 
        'locked': Site_locked, 
        'totalPoints': Site_total_points, 
        'siteGrowth': Site_growth_factor
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

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

  onOpen_Load(){
    this.populateForm();
  }

  ngOnInit(): void {

    this.CurrentSiteInfo_Template = this.site_Array.find(({ _id }) => _id === this.CurrentSiteInfo?.site_id );
  }

}
