import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-success-form',
    templateUrl: './success.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class SuccessComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private domSanitizer = inject(DomSanitizer);



  successFullText: SafeHtml = '';

  ngOnInit() {
    if (!this.data || !this.data.data) {
      return;
    }

    this.successFullText =  this.domSanitizer.bypassSecurityTrustHtml(this.data.data);

  }

}
