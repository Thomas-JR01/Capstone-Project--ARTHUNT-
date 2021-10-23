import { Component, OnInit, Input } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';


@Component({
  selector: 'app-site-attempt',
  templateUrl: './site-attempt.component.html',
  styleUrls: ['./site-attempt.component.css']
})
export class SiteAttemptComponent implements OnInit {

  SiteAttemptForm = this.formBuilder.group({
    SiteAttempt_Title: '',
    SiteAttempt_Year: '',
    SiteAttempt_Artist: '',
    SiteAttempt_Theme: '',
    SiteAttempt_CloseUpImage: '',
    SiteAttempt_TeamPhoto: ''
  })

  imgvalue : Array<{img_path : String, img : String | void}> | undefined;

  siteNum: number = 0;
  growth_factor: Number = 0; 
  total_points: Number = 0;
  siteHint: String = "";
  siteQuestionChoices: {
    artist: Array<{value: String}>,
    closeup: Array<{value: string}>,
    theme: Array<{value: String}>,
    title: Array<{value: String}>,
    year: Array<{value: String}> } | undefined;

  fileReader: FileReader = new FileReader();

  constructor(
    private jwtHelper: JwtHelperService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { 
    const routeParams = this.route.snapshot.paramMap;
    this.siteNum = Number(routeParams.get('siteID'));
  }


  getEventID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.eventID;
  }

  getTeamID() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.teamID;
  }

  async getImage(img_path : Array<String>) {

    let temp_imgvalue : Array<{img_path : String, img : String | void}> = [];

    for (let i = 0; i < img_path.length; i++) {//img_path.length

      const response = await fetch(`${environment.API_URL}/client-api/images/thumbnail/${ img_path[i].split(".")[0] }`, {
        method: 'GET',
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(rsp => rsp.json())
      .catch((err) => console.log(err))

      if (response.status === "success") {
        temp_imgvalue.push({img_path : img_path[i], img : response.response});
      }

    }

    this.imgvalue = temp_imgvalue;

  }

  async getSiteQuestions() {
    const response = await fetch(`${environment.API_URL}/client-api/site-info/${this.siteNum}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.growth_factor = Math.round(response.response.growth_rate * 100) / 100;
      this.total_points = Math.round(response.response.points.total_amt);

      //console.log(response.response.choices);

      this.siteQuestionChoices = response.response.choices;
      this.siteHint = response.response.hint;

      this.getImage(response.response.choices.closeup);
    }
  }

  async submitSiteAttempt() {
    if (confirm('Are you sure?\nYou will lose points for wrong answers!')) {
      const SiteTitle_A = String(this.SiteAttemptForm.get('SiteAttempt_Title')?.value);
      const SiteYear_A = String(this.SiteAttemptForm.get('SiteAttempt_Year')?.value);
      const SiteArtist_A = String(this.SiteAttemptForm.get('SiteAttempt_Artist')?.value);
      const SiteTheme_A = String(this.SiteAttemptForm.get('SiteAttempt_Theme')?.value);
      const CloseUpImage_A = String(this.SiteAttemptForm.get('SiteAttempt_CloseUpImage')?.value);
  
      const base64 : String = String(this.fileReader.result);
      const Team_Image_Name : String = `${this.getEventID()}_${this.siteNum}_${Date.now()}`;
  
      //console.log(base64.split(",")[1]);
      //console.log(Team_Image_Name);
      //console.log(base64.length);
      
      if (base64.length < 10) {window.alert('No Team Image Submitted'); return;}
      if (base64.length > 9000000) {window.alert('Image Size Too Large'); return;}
  
      //Send Team IMG Data
      const response1 = await fetch(`${environment.API_URL}/client-api/save-image/${Team_Image_Name}`, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          'img_data': base64.split(",")[1]
        })
      })
      .then(rsp => rsp.json())
      .catch((err) => console.log(err))
      if (response1.status === "success") {}
  
      //Send -- Title/Year/Artist/CloseUpImage_Path -- TeamPhoto_A To Server
      const response2 = await fetch(`${environment.API_URL}/client-api/site-attempt/${this.siteNum}`, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          'answers': {
            "title": SiteTitle_A,
            "theme": SiteTheme_A,
            "closeup": CloseUpImage_A,
            "artist": SiteArtist_A,
            "year": SiteYear_A
          },
          'team_img': Team_Image_Name,
          'notes': this.siteHint
        })
      })
      .then(rsp => rsp.json())
      .catch((err) => console.log(err))
      //console.log(response2)
      if (response2.status === "success") {}
      else if (response2.status === "error") {
        confirm(response2.message);
      }
      //Navigate Back to Home Page
      this.router.navigate([`../`])
    }
  }

  public onChange(event : any): void {
    let file = event.target.files[0];
    this.fileReader.readAsDataURL(file);
  }

  ngOnInit(): void {
    //console.log(this.siteNum);
    this.getSiteQuestions();
  }

}
