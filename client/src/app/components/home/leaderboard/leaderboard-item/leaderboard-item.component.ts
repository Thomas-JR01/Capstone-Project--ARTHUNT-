import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-leaderboard-item',
  templateUrl: './leaderboard-item.component.html',
  styleUrls: ['./leaderboard-item.component.css']
})
export class LeaderboardItemComponent implements OnInit {
  @Input() entry: {rank: number, name: String, points: number} | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
