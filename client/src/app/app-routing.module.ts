import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SelectMemberComponent } from './components/login/select-member/select-member.component';
import { HomeComponent } from './components/home/home.component';
import { EventsComponent } from './components/events/events.component';
import { ContactsComponent } from './components/home/contacts/contacts.component';
import { SitesListComponent } from './components/home/sites-list/sites-list.component';
import { LeaderboardComponent } from './components/home/leaderboard/leaderboard.component';
import { MapComponent } from './components/home/map/map.component';
import { StrategiesComponent } from './components/home/strategies/strategies.component';
import { SiteAttemptComponent } from './components/home/site-attempt/site-attempt.component';
import { InstructionsComponent } from './components/home/instructions/instructions.component';
import { SiteHistoryComponent } from './components/home/site-history/site-history.component';
import { MessageComponent } from './components/home/message/message.component';

const routes: Routes = [
  // authenticated routes
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [AuthGuard] },
  { path: 'siteslist', component: SitesListComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'strategies', component: StrategiesComponent, canActivate: [AuthGuard] },
  { path: 'site-attempt/:siteID', component: SiteAttemptComponent, canActivate: [AuthGuard]},
  { path: 'instructions', component: InstructionsComponent, canActivate: [AuthGuard]},
  { path: 'site-history', component: SiteHistoryComponent, canActivate: [AuthGuard]},
  { path: 'messages', component: MessageComponent, canActivate: [AuthGuard]},

  { path: 'login', component: EventsComponent},
  { path: 'login/:eventID', component: LoginComponent},
  { path: 'selectmember', component: SelectMemberComponent},
  { path: 'register/:eventId', component: RegisterComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
