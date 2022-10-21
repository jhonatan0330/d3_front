import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html'
})
export class GpsComponent implements OnInit {

  isActive = false;
  
  constructor() { }

  ngOnInit(): void {
  }

  send2Server(): boolean {
    return true;
  }

}
