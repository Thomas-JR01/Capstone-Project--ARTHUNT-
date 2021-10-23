import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { point } from 'leaflet';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  loading: boolean = true;
  eventId: Number = 404;

  Stats_Running_Total: number = 0;
  Stats_Running_Total_Count: number = 0;

  final_teams_summary: any;
  teams_total_stats: any;
  teams_sites_stats: any;
  teams_strategy_stats: any;
  teams_growth_stats: any;
  teams_transfer_stats: any;

  //Structure [name: XX series: [{"name": "Germany","value": 8940000},{"name": "USA","value": 5000000}]]
  StrategyData_Formatted: any;
  Current_StrategyData: any;

  ImportedData: Array<{
    team_name: String,
    team_id: number,
    final_summary: {total: number, sites: number, strategy: number, growth: number, transfer: number},
    total: [{timestamp:Date, new_value:number, points_diff:number}],
    sites: [{timestamp:Date, new_value:number, points_diff:number}],
    strategy: [{timestamp:Date, new_value:number, points_diff:number}],
    growth: [{timestamp:Date, new_value:number, points_diff:number}],
    transfer: [{timestamp:Date, new_value:number, points_diff:number}]
    }> = [];

  StrategyData: Array<{
    name: String,
    description: String,
    team_gains: [{team_id: number, points_gain: number}]
    }> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    const routeParams = this.route.snapshot.paramMap;
    this.eventId = Number(routeParams.get('eventID'));
   }


  // initialisation of stats data
  async getStats() {
    const response = await fetch(`${environment.API_URL}/admin-api/statistics/${this.eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.ImportedData = response.response;
      //console.log(response.response);
      this.structureData();
      this.loading = false;
    }
  }

  parseDate(date: Date) {
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let meridiem = hour < 12 ? "am" : "pm";

    hour = hour % 12 === 0 ? 12 : hour % 12; // format hours to 12 hour time

    const twelveHourTime = (hour).toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + " " + meridiem;

    return twelveHourTime;
  }

  getTeamName(T_ID: any) {
    for (let i = 0; i < this.ImportedData.length; i++){
      if (this.ImportedData[i].team_id == T_ID) {
        return this.ImportedData[i].team_name;
      }
    }
    return null;
  }

  async getStats_Strategy() {
    const response = await fetch(`${environment.API_URL}/admin-api/strategies/${this.eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': "application/json",
		    'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(rsp => rsp.json())
    .catch((err) => console.log(err))

    if (response.status === "success") {
      this.StrategyData = response.response;

      this.StrategyData_Formatted = this.StrategyData.map((data)=>{
        return {
          name: data.name,
          series: data.team_gains.map((TGdata)=>{
            return { 
              name: this.getTeamName(TGdata.team_id), //TGdata.team_id.toString()
              value: TGdata.points_gain
            }})
        }});
      
      this.Current_StrategyData = this.StrategyData_Formatted[0].series;

      //console.log(response.response);
      
    }
  }


  structureData(){
    //mockData = [{name: "Germany",series: [{name: "2010",value: 5000},{name: "2011",value: 6500},{name: "2012",value: 4000},{name: "2013",value: 9200}]}, ...];

    //Structure - final_teams_summary
    this.final_teams_summary = this.ImportedData.map((data)=>{
      return {
        name: data.team_name,
        series: [
          {name: "Sites", value: data.final_summary.sites},
          {name: "Strategy", value: data.final_summary.strategy},
          {name: "Growth", value: data.final_summary.growth},
          {name: "Transfer", value: data.final_summary.transfer}
        ]
      }});

    //Structure - teams_total_stats
    this.teams_total_stats = this.ImportedData.map((data)=>{
      return {
        name: data.team_name,
        series: data.total.map((seriesdata)=>{
          return {
            name: this.parseDate(new Date(seriesdata.timestamp)),
            value: seriesdata.new_value
          }})
      }});

    //Structure - teams_sites_stats
    this.teams_sites_stats = this.ImportedData.map((data)=>{
      return {
        name: data.team_name,
        series: data.sites.map((seriesdata)=>{
          return {
            name: this.parseDate(new Date(seriesdata.timestamp)),
            value: this.RunningTotal(seriesdata.points_diff, data.sites.length) 
          }})
      }});

    //Structure - teams_strategy_stats
    this.teams_strategy_stats = this.ImportedData.map((data)=>{
      return {
        name: data.team_name,
        series: data.strategy.map((seriesdata)=>{
          return {
            name: this.parseDate(new Date(seriesdata.timestamp)),
            value: this.RunningTotal(seriesdata.points_diff, data.sites.length) 
          }})
      }});

    //Structure - teams_growth_stats
    this.teams_growth_stats = this.ImportedData.map((data)=>{
      return {
        name: data.team_name,
        series: data.growth.map((seriesdata)=>{
          return {
            name: this.parseDate(new Date(seriesdata.timestamp)),
            value: this.RunningTotal(seriesdata.points_diff, data.sites.length) 
          }})
      }});

    //Structure - teams_transfer_stats
    this.teams_transfer_stats = this.ImportedData.map((data)=>{
      return {
        name: data.team_name,
        series: data.transfer.map((seriesdata)=>{
          return {
            name: this.parseDate(new Date(seriesdata.timestamp)),
            value: this.RunningTotal(seriesdata.points_diff, data.sites.length) 
          }})
      }});

  }

  RunningTotal(NewValue: number, ArraySize: number): number {
    if (!(this.Stats_Running_Total_Count < ArraySize)){
      this.Stats_Running_Total_Count = 0;
      this.Stats_Running_Total = 0;
    }
    this.Stats_Running_Total = this.Stats_Running_Total + NewValue;
    this.Stats_Running_Total_Count++;
    return this.Stats_Running_Total;
  }



  ngOnInit(): void {
    this.getStats();
    this.getStats_Strategy();
    
  }

}
