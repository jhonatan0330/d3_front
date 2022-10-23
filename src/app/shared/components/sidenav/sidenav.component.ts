import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.template.html'
})
export class SidenavComponent  {
  @Input() public menuItems: any[] = [];
  @Input() public hasIconTypeMenuItem: boolean;
  @Input() public iconTypeMenuTitle: string;

  constructor() {}

}
