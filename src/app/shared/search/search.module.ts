import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputOverComponent } from './search-input-over/search-input-over.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [SearchInputOverComponent],
  exports: [SearchInputOverComponent],
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    CommonModule,
    MatProgressBarModule
  ],
})
export class SearchModule {}
