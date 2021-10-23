import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  cityLat: Number = 0;
  cityLong: Number = 0;
  gameMap: any;
  mapMarkers: any = [];

  // site clicked info
  siteSelected: boolean = false;
  siteNum: number = -1;
  points: number = 0;
  growth: number = 0.0;
  hint: string = "";

  constructor(
    private route: ActivatedRoute
  ) { }

  addMarker(site: any) {
    // icon
    var customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/iconic/open-iconic/master/png/map-marker-8x.png',
      iconSize: [32, 32],
      iconAnchor: [32,32]
    });

    const options = {
      icon: customIcon,
      radius: 30,
      opacity: 5,
      color: '#686868',

    }
    
    const data = {
      siteNum: site.site_num,
      points: Math.round(site.total_points),
      growth: Math.round(site.growth_factor * 100) / 100,
      hint: site.hint
    }

    var marker = L.circle([site.lat, site.long], options).on('mousedown', e => {
      this.siteNum = data.siteNum;
      this.points = Math.round(data.points);
      this.growth = data.growth;
      this.hint = data.hint;
      this.siteSelected = true;
    })

    marker.addTo(this.gameMap);
    this.mapMarkers.push({marker, data});
  }

  getSitesInfo() {
    const response = fetch(`${environment.API_URL}/admin-api/sites-info/${this.getEventID()}`, {
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


  getEventID(){
    const routeParams = this.route.snapshot.paramMap;
    return Number(routeParams.get('eventID'));
  }

  async getCityLoc() {
    // api call to get map coordinates
    const response = await fetch(`${environment.API_URL}/admin-api/event-data/${this.getEventID()}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .then(rsp => {
      //console.log("city loc", rsp)
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
    this.gameMap.setView([this.cityLat, this.cityLong], 16);
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

  addTeamMarker(name: string, lat: number, long: number) {
    var marker = L.marker([lat, long]).bindPopup(name, {autoClose: false}).openPopup().addTo(this.gameMap).openPopup();
    var icon:any = marker.options.icon;
    icon.options.iconSize = [25 * 1.5, 41 * 1.5]; // default size [25, 41]
    marker.setIcon(icon);
  }

  markTeamLocations() {
    const response = fetch(`${environment.API_URL}/admin-api/team-locations/${this.getEventID()}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then((rsp) => rsp.json())
    .then((rsp) => {
      //console.log(rsp)
      
      if (rsp.status === "success") {
        rsp.response.forEach((team:any) => {
          this.addTeamMarker(team.name, team.team_lat, team.team_long);
        });
      }
    })
  }

  clearToolTips() {
    this.gameMap.eachLayer((layer: any) => {
      if(layer.options.pane === "tooltipPane") layer.removeFrom(this.gameMap);
    });
  }

  ngOnInit(): void {
    this.gameMap = L.map('mapid', {});
    this.getCityLoc();

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom:20,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoibmdoaWFseTEiLCJhIjoiY2tzYmJnMnB4MDUyeDJ2cDNjbThpNWVjZSJ9.1kxDFDti41Vp-wd_14LIlg'
    }).addTo(this.gameMap);
    this.getSitesInfo();
    this.markTeamLocations();
  }
}
