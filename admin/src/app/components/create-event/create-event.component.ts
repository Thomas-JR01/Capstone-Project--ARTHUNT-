import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  eventcreateForm = this.formBuilder.group({
    EventName: '',
    Location: '',
    CoordinatorName: '',
    Contact: '',
    
    E_S_GameTime: 10800,
    E_S_RoundTime: 60,
    E_S_RecoveryTime: 180,
    E_S_QuestionNum: 10,
    Default_Points: 100,

    S_S_StartingPoints: 100,
    S_S_TeamPhoto: 25,
    S_S_Title: 5,
    S_S_Theme: 40,
    S_S_CloseUp: 20,
    S_S_Artist: 5,
    S_S_Year: 5,
    S_S_GrowthRate: 1.1
  })

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  async createEvent() {
    const EventName = String(this.eventcreateForm.get('EventName')?.value);
    const Location = String(this.eventcreateForm.get('Location')?.value);
    const CoordinatorName = String(this.eventcreateForm.get('CoordinatorName')?.value);
    const Contact = String(this.eventcreateForm.get('Contact')?.value);
    const Settings = { 
      event_settings: {
        game_time: this.eventcreateForm.get('E_S_GameTime')?.value,
        round_duration: this.eventcreateForm.get('E_S_RoundTime')?.value,
        reset_duration: this.eventcreateForm.get('E_S_RecoveryTime')?.value,
        question_number: this.eventcreateForm.get('E_S_QuestionNum')?.value
      },
      site_points: {
        total_amt: this.eventcreateForm.get('S_S_StartingPoints')?.value,
        site_pct: this.eventcreateForm.get('S_S_TeamPhoto')?.value,
        title_pct: this.eventcreateForm.get('S_S_Title')?.value,
        theme_pct: this.eventcreateForm.get('S_S_Theme')?.value,
        closeup_pct: this.eventcreateForm.get('S_S_CloseUp')?.value,
        artist_pct: this.eventcreateForm.get('S_S_Artist')?.value, 
        year_pct: this.eventcreateForm.get('S_S_Year')?.value,
      },
      growth_rate: this.eventcreateForm.get('S_S_GrowthRate')?.value, 
      team_points: this.eventcreateForm.get('Default_Points')?.value, 
    };



    //${environment.API_URL}/admin-api/create-event/
    const response = await fetch(`${environment.API_URL}/admin-api/create-event/`, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        'name': EventName,
        'city': Location,
        'coordinator': CoordinatorName,
        'contact': Contact,
        'settings': Settings
      })
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    this.router.navigate([`/events`])

  }







  ngOnInit(): void {
  }

}

