import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule} from '@angular/material/icon';
import { MatFormFieldModule } from  '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { JwtModule } from '@auth0/angular-jwt';
import { FormsModule } from '@angular/forms';
import { WebcamModule } from 'ngx-webcam';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { SelectMemberComponent } from './components/login/select-member/select-member.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddMemberComponent } from './components/register/add-member/add-member.component';
import { MastheadComponent } from './components/masthead/masthead.component';
import { EventsComponent } from './components/events/events.component';
import { ContactsComponent } from './components/home/contacts/contacts.component';
import { SitesListComponent } from './components/home/sites-list/sites-list.component';
import { SiteListItemComponent } from './components/home/sites-list/site-list-item/site-list-item.component';
import { LeaderboardComponent } from './components/home/leaderboard/leaderboard.component';
import { LeaderboardItemComponent } from './components/home/leaderboard/leaderboard-item/leaderboard-item.component';
import { MapComponent } from './components/home/map/map.component';
import { StrategiesComponent } from './components/home/strategies/strategies.component';
import { StrategyItemComponent } from './components/home/strategies/strategy-item/strategy-item.component';
import { TransferPointsComponent } from './components/home/transfer-points/transfer-points.component';
import { SiteAttemptComponent } from './components/home/site-attempt/site-attempt.component';
import { InstructionsComponent } from './components/home/instructions/instructions.component';
import { SiteHistoryComponent } from './components/home/site-history/site-history.component';
import { SiteVisitComponent } from './components/home/site-history/site-visit/site-visit.component';
import { MessageComponent } from './components/home/message/message.component';
import { TextComponent } from './components/home/message/text/text.component';
import { LoadingComponent } from './components/loading/loading.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    SelectMemberComponent,
    AddMemberComponent,
    MastheadComponent,
    EventsComponent,
    ContactsComponent,
    SitesListComponent,
    SiteListItemComponent,
    LeaderboardComponent,
    LeaderboardItemComponent,
    MapComponent,
    StrategiesComponent,
    StrategyItemComponent,
    TransferPointsComponent,
    SiteAttemptComponent,
    InstructionsComponent,
    SiteHistoryComponent,
    SiteVisitComponent,
    MessageComponent,
    TextComponent,
    LoadingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    WebcamModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    JwtModule.forRoot({})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
