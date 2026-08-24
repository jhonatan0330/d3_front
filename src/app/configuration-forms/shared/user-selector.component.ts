import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { PropertyService } from './property.service';

@Component({
    selector: 'app-user-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
    template: `
    <div class="relative">
      <label class="block text-sm font-semibold mb-1">{{ label }}</label>
      <div class="relative">
        <input type="text"
          [value]="displayValue"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          placeholder="Buscar usuario..."
          class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        @if (displayValue) {
          <button type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            (click)="clear()">
            <mat-icon class="text-sm">clear</mat-icon>
          </button>
        }
      </div>

      @if (showDropdown && usuarios.length > 0) {
        <div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          @for (user of usuarios; track user.llaveTabla) {
            <button type="button"
              class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              (click)="selectUser(user)">
              <mat-icon class="text-gray-400">person</mat-icon>
              <span class="text-sm text-gray-900 dark:text-gray-100">{{ user.nombre }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">({{ user.codigo }})</span>
            </button>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class UserSelectorComponent implements OnInit {
    private propertyService = inject(PropertyService);

    @Input() label = 'Usuario';
    @Input() value: string = '';
    @Output() valueChange = new EventEmitter<string>();
    @Output() usuarioSelected = new EventEmitter<UsuarioDTO>();

    displayValue = '';
    usuarios: UsuarioDTO[] = [];
    showDropdown = false;
    private debounceTimer: any;

    ngOnInit(): void {
        if (this.value) {
            this.loadUserDisplay(this.value);
        }
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.searchUsers(value);
        }, 200);
    }

    onFocus(): void {
        this.showDropdown = true;
    }

    onBlur(): void {
        setTimeout(() => { this.showDropdown = false; }, 200);
    }

    searchUsers(filtro: string): void {
        if (!filtro || filtro.length < 2) {
            this.usuarios = [];
            return;
        }

        this.propertyService['http'].post<UsuarioDTO[]>(
            this.propertyService['ls'].getUrlAccess('/api/config/users/search', undefined),
            { estado: 'A', filtroParametro: filtro }
        ).subscribe({
            next: (users) => this.usuarios = users,
            error: () => this.usuarios = []
        });
    }

    selectUser(user: UsuarioDTO): void {
        this.value = user.llaveTabla;
        this.displayValue = user.nombre;
        this.valueChange.emit(this.value);
        this.usuarioSelected.emit(user);
        this.usuarios = [];
        this.showDropdown = false;
    }

    clear(): void {
        this.value = '';
        this.displayValue = '';
        this.valueChange.emit('');
    }

    private loadUserDisplay(key: string): void {
        this.propertyService['http'].post<UsuarioDTO>(
            this.propertyService['ls'].getUrlAccess('/api/config/users/by-id', undefined),
            key
        ).subscribe({
            next: (user) => this.displayValue = user.nombre,
            error: () => {}
        });
    }
}