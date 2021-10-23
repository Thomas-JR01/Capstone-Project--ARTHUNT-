import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as L from 'leaflet';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  eventId: number = -1;
  currentMarker : any;
  cityLat: number = -27.4705;
  cityLong: number = 153.0260;
  gameMap: any;
  mapMarkers: any = [];

  // info block
  siteSelected: boolean = false;
  siteNum: number = -1;
  points: number = 0;
  growth: number = 0.0;
  hint: string = "";
  locked: boolean = false;

  constructor(
    private jwtHelper: JwtHelperService,
    private router: Router
  ) { }

  getVirtual() {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    return payload.virtual;
  }

  addMarker(site: any) {
    // icon
    var customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/iconic/open-iconic/master/png/map-marker-8x.png',
      iconSize: [32, 32],
      iconAnchor: [32,32]
    });

    const options = {
      //icon: customIcon,
      radius: 30,
      opacity: 1,
      color: '#686868',
      weight: 1
    }
    
    const data = {
      siteNum: site.site_num,
      points: Math.round(site.total_points),
      growth: Math.round(site.growth_factor * 100) / 100,
      hint: site.hint,
      locked: site.locked
    }

    var marker = L.circle([site.lat, site.long], options).on('mousedown', e => {
      this.siteNum = data.siteNum;
      this.points = data.points;
      this.growth = data.growth;
      this.hint = data.hint;
      this.locked = data.locked;
      this.siteSelected = true;
    })

    marker.addTo(this.gameMap);
    this.mapMarkers.push({marker, data});
  }

  getSitesInfo() {
    const response = fetch(`${environment.API_URL}/client-api/sites-info`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .then(rsp => {
      //console.log(rsp)
      if (rsp.status === "success") {
        // mark sites on map
        rsp.response.forEach((site:any) => {
          this.addMarker(site);
        });
      }
    })
    .catch((err) => console.log(err))
  }

  async gotoSiteAttempt() {
    // check if locked first, if locked dont navigate and send window confirm
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
      if (response.response.locked) {
        if (confirm(`Site ${this.siteNum} is locked!\nAn attempt made on this site is still being reviewed`)) {
          return;
        }
      }
      else {
        this.router.navigate([`/site-attempt/${this.siteNum}`]);
      }
    }
  }

  async getCityLoc() {
    // api call to get map coordinates
    const response = await fetch(`${environment.API_URL}/client-api/event-location/`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .then(rsp => {
      if (rsp.status === "success") {
        this.cityLat = rsp.response.base_lat;
        this.cityLong = rsp.response.base_long;
        this.resetMapView();
      }
    })
    .catch((err) => console.log(err))

  }

  async resetMapView() {
    this.clearToolTips();
    this.gameMap.setView([this.cityLat, this.cityLong], 15);
  }

  markSiteNum() {
    this.clearToolTips();
    this.mapMarkers.forEach((item:any) => {
      var text = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'marker-label'
      })
      .setContent(`${item.data.siteNum}`)
      .setLatLng(item.marker.getLatLng())
      text.addTo(this.gameMap);
      
      item.marker.setStyle({fillColor: '#686868', opacity: 1})
    })
  }

  markSitePoints() {
    this.clearToolTips();
    this.mapMarkers.forEach((item:any) => {
      var text = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'marker-label',
        
      })
      .setContent(`${item.data.points}`)
      .setLatLng(item.marker.getLatLng());
      text.addTo(this.gameMap);

      item.marker.setStyle({fillColor: '#686868', opacity: 1})
    })
  }

  markSiteGrowth() {
    this.clearToolTips();
    this.mapMarkers.forEach((item:any) => {
      var text = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'marker-label'
      })
      .setContent(`${item.data.growth}`)
      .setLatLng(item.marker.getLatLng());
      text.addTo(this.gameMap);

      item.marker.setStyle({fillColor: '#686868', opacity: 1})
    })
  }

  clearToolTips() {
    this.gameMap.eachLayer((layer: any) => {
      if(layer.options.pane === "tooltipPane") layer.removeFrom(this.gameMap);
    });
  }

  addTeamMarker(name: string, lat: number, long: number) {
    var marker = L.marker([lat, long]).bindPopup(name, {autoClose: false}).openPopup().addTo(this.gameMap).openPopup();
    var icon:any = marker.options.icon;
    icon.options.iconSize = [25, 41]; // default size [25, 41]
    marker.setIcon(icon);
  }

  markTeamLocations() {
    const response = fetch(`${environment.API_URL}/client-api/team-locations`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then((rsp) => rsp.json())
    .then((rsp) => {
      
      if (rsp.status === "success") {
        rsp.response.forEach((team:any) => {
          this.addTeamMarker(team.name, team.team_lat, team.team_long);
        });
      }
    })
  }

  ngOnInit(): void {
    const token = localStorage.getItem("token") || "";
    const payload = this.jwtHelper.decodeToken(token);
    this.eventId = payload.eventID;

    this.gameMap = L.map('mapid', {attributionControl: false});
    this.getCityLoc();

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoibmdoaWFseTEiLCJhIjoiY2tzYmJnMnB4MDUyeDJ2cDNjbThpNWVjZSJ9.1kxDFDti41Vp-wd_14LIlg'
    }).addTo(this.gameMap);

    this.getSitesInfo();

    if (this.getVirtual()) {
      this.markTeamLocations();
    }
  }
}
