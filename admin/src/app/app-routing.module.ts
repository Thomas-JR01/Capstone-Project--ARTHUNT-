import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

import { CreateEventComponent } from './components/create-event/create-event.component';
import { EventsComponent } from './components/events/events.component';
import { LoginComponent } from './components/login/login.component';
import { ManageEventComponent } from './components/manage-event/manage-event.component';
import { TeamsComponent } from './components/manage-event/teams/teams.component';
import { SiteInfoComponent } from './components/site-info/site-info.component';
import { EditSiteInfoComponent } from './components/site-info/edit-site-info/edit-site-info.component';
import { EventQrComponent } from './components/event-qr/event-qr.component';
import { EventSiteInfoComponent } from './components/manage-event/event-site-info/event-site-info.component';
import { EventSlideshowComponent } from './components/manage-event/event-slideshow/event-slideshow.component';
import { CreateAdminComponent } from './components/create-admin/create-admin.component';


const routes: Routes = [
  // authenticated routes
  { path: '', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard]},
  { path: 'create_event', component: CreateEventComponent, canActivate: [AuthGuard]},
  { path: 'create_admin', component: CreateAdminComponent, canActivate: [AuthGuard]},
  { path: 'manage_event/:eventID', component: ManageEventComponent, canActivate: [AuthGuard]},
  { path: 'site_info', component: SiteInfoComponent, canActivate: [AuthGuard]},
  { path: 'edit_site_info/:siteLocation/:siteTitle', component: EditSiteInfoComponent, canActivate: [AuthGuard]},
  { path: 'event-site-info', component: EventSiteInfoComponent, canActivate: [AuthGuard]},
  { path: 'event-qr/:eventID', component: EventQrComponent, canActivate: [AuthGuard]},
  { path: 'event-show/:eventID', component: EventSlideshowComponent, canActivate: [AuthGuard]},


  { path: 'login', component: LoginComponent},
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
