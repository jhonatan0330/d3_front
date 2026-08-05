import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-success-form',
    templateUrl: './success.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class SuccessComponent implements OnInit {


  successFullText: SafeHtml = '';
  constructor(
     @Inject(MAT_DIALOG_DATA) public data: any,
     private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    if (!this.data || !this.data.data) {
      return;
    }

    this.successFullText =  this.domSanitizer.bypassSecurityTrustHtml(this.data.data);

  }

}
