import { Component, OnInit, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-site-info',
  templateUrl: './edit-site-info.component.html',
  styleUrls: ['./edit-site-info.component.css']
})
export class EditSiteInfoComponent implements OnInit {

  IMAGE_main_img: String | void = "";
  IMAGE_closeup_img: String | void = "";
  fileReader_main: FileReader = new FileReader();
  fileReader_closeup: FileReader = new FileReader();

  site: {
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
    notes: String
  } | undefined;

  eventcreateForm = this.formBuilder.group({
    location: '',
    main_img: '',
    closeup: '',
    title: '',
    artist: '',
    year: 0,
    active: true,
    theme: '',
    lat: 0,
    long: 0,
    information: '',
    type: '',
    clue: '',
    notes: ''
  });

  siteLocation: String = "";
  siteTitle: String = "";

  constructor(
    private jwtHelper: JwtHelperService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { 
    const routeParams = this.route.snapshot.paramMap;
    this.siteLocation = String(routeParams.get('siteLocation'));
    this.siteTitle = String(routeParams.get('siteTitle'));
  }

  async getSites() {
    const response = await fetch(`${environment.API_URL}/admin-api/site-templates/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      for (let i = 0; i < response.response.length; i++) {
        if ((response.response[i].location == this.siteLocation) && (response.response[i].title == this.siteTitle)) {
          this.site = response.response[i];
          //console.log(this.site); 
          
          this.getImage("main", response.response[i].main_img)
          .then(rsp => {
            if (rsp !== null) {this.IMAGE_main_img = rsp;}
          })

          this.getImage("thumbnail", response.response[i].closeup)
          .then(rsp => {
            if (rsp !== null) {this.IMAGE_closeup_img = rsp;}
          })

          i = response.response.length + 1;
        }

        this.eventcreateForm = this.formBuilder.group({
          location: this.site?.location,
          main_img: '',
          closeup: '',
          title: this.site?.title,
          artist: this.site?.artist,
          year: this.site?.year,
          active: this.site?.active,
          theme: this.site?.theme,
          lat: this.site?.lat,
          long: this.site?.long,
          information: this.site?.information,
          type: this.site?.type,
          clue: this.site?.clue,
          notes: this.site?.notes
        })

      }
    }
  }

  async updateSite() {

    const base64_main : String = String(this.fileReader_main.result);
    const base64_closeup : String = String(this.fileReader_closeup.result);

    if (base64_main != null) {
      if (base64_main.length > 9000000) {window.alert('Image Size Too Large'); return;}
       //Send Team IMG Data
        const response1 = await fetch(`${environment.API_URL}/admin-api/save-image/main/${this.site?.main_img}`, {
          method: 'POST',
          headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            'img_data': base64_main.split(",")[1]
          })
        })
        .then(rsp => rsp.json())
        .catch((err) => console.log(err))
        if (response1.status === "success") {}
    }

    if (base64_closeup != null) {
      if (base64_closeup.length > 9000000) {window.alert('Image Size Too Large'); return;}
      //Send Team IMG Data
      const response2 = await fetch(`${environment.API_URL}/admin-api/save-image/thumbnail/${this.site?.closeup}`, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          'img_data': base64_closeup.split(",")[1]
        })
      })
      .then(rsp => rsp.json())
      .catch((err) => console.log(err))
      if (response2.status === "success") {}
    }

    const UpdatedSite = { 
      location: this.eventcreateForm.get('location')?.value,
      main_img: this.site?.main_img,
      closeup: this.site?.closeup,
      title: this.eventcreateForm.get('title')?.value,
      artist: this.eventcreateForm.get('artist')?.value,
      year: this.eventcreateForm.get('year')?.value,
      active: this.eventcreateForm.get('active')?.value,
      theme: this.eventcreateForm.get('theme')?.value,
      lat: this.eventcreateForm.get('lat')?.value,
      long: this.eventcreateForm.get('long')?.value,
      information: this.eventcreateForm.get('information')?.value,
      type: this.eventcreateForm.get('type')?.value,
      clue: this.eventcreateForm.get('clue')?.value,
      notes: this.eventcreateForm.get('notes')?.value
    };

    //${environment.API_URL}/admin-api/edit-site-template/
    const response = await fetch(`${environment.API_URL}/admin-api/edit-site-template/${this.site?._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        new_data: UpdatedSite
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))
    
    this.router.navigate([`/events`])
    
  }

  public onChange_main(event : any): void {
    let file = event.target.files[0];
    this.fileReader_main.readAsDataURL(file);
  }

  public onChange_closeup(event : any): void {
    let file = event.target.files[0];
    this.fileReader_closeup.readAsDataURL(file);
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


  

  ngOnInit(): void {
    this.getSites();
  }

}
