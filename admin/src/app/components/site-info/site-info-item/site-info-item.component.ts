import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-site-info-item',
  templateUrl: './site-info-item.component.html',
  styleUrls: ['./site-info-item.component.css']
})
export class SiteInfoItemComponent implements OnInit {
  @Input() site: {
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



  constructor(
    private router: Router,
  ) { }

  gotoEditSite() {
    this.router.navigate([`/edit_site_info/${this.site?.location}/${this.site?.title}`]);
  }

  ngOnInit(): void {
  }

}
