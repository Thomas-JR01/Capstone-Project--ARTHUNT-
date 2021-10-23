import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule }from '@swimlane/ngx-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { EventsComponent } from './components/events/events.component';
import { EventButtonComponent } from './components/events/event-button/event-button.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { ManageEventComponent } from './components/manage-event/manage-event.component';
import { DashboardComponent } from './components/manage-event/dashboard/dashboard.component';
import { DeleteEventConfirmationComponent } from './components/events/event-button/delete-event-confirmation/delete-event-confirmation.component';
import { TeamsComponent } from './components/manage-event/teams/teams.component';
import { MapComponent } from './components/manage-event/map/map.component';
import { ReviewAttemptsComponent } from './components/manage-event/review-attempts/review-attempts.component';
import { MarkAttemptComponent } from './components/manage-event/review-attempts/mark-attempt/mark-attempt.component';
import { CommunicationsComponent } from './components/manage-event/communications/communications.component';
import { StatisticsComponent } from './components/manage-event/statistics/statistics.component';
import { EditEventComponent } from './components/manage-event/edit-event/edit-event.component';
import { SiteInfoComponent } from './components/site-info/site-info.component';
import { SiteInfoItemComponent } from './components/site-info/site-info-item/site-info-item.component';
import { EditSiteInfoComponent } from './components/site-info/edit-site-info/edit-site-info.component';
import { ChatWindowComponent } from './components/manage-event/communications/chat-window/chat-window.component';
import { EventQrComponent } from './components/event-qr/event-qr.component';
import { EventSiteInfoComponent } from './components/manage-event/event-site-info/event-site-info.component';
import { EventSiteInfoItemComponent } from './components/manage-event/event-site-info/event-site-info-item/event-site-info-item.component';
import { EventSlideshowComponent } from './components/manage-event/event-slideshow/event-slideshow.component';
import { CreateAdminComponent } from './components/create-admin/create-admin.component';
import { LoadingComponent } from './components/loading/loading.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EventsComponent,
    EventButtonComponent,
    CreateEventComponent,
    ManageEventComponent,
    DashboardComponent,
    DeleteEventConfirmationComponent,
    TeamsComponent,
    MapComponent,
    ReviewAttemptsComponent,
    MarkAttemptComponent,
    CommunicationsComponent,
    StatisticsComponent,
    EditEventComponent,
    SiteInfoComponent,
    SiteInfoItemComponent,
    EditSiteInfoComponent,
    ChatWindowComponent,
    EventQrComponent,
    EventSiteInfoComponent,
    EventSiteInfoItemComponent,
    EventSlideshowComponent,
    CreateAdminComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    MatProgressSpinnerModule,
    JwtModule.forRoot({})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
