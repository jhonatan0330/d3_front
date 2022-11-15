import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-croquis',
  templateUrl: './croquis.component.html',
  styleUrls: ['./croquis.component.scss']
})
export class CroquisComponent extends BaseComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
