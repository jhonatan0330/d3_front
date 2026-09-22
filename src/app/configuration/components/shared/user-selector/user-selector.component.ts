import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioDTO } from 'app/authentication/domain/authentication.domain';
import { ConfigUserService } from 'app/configuration/configuracion.api';

@Component({
    selector: 'app-user-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
    templateUrl: './user-selector.component.html',
    styleUrl: './user-selector.component.scss'
})
export class UserSelectorComponent implements OnInit {
    private configUserService = inject(ConfigUserService);

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

        this.configUserService.searchUsers({ estado: 'A', filtroParametro: filtro }).subscribe({
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
        this.configUserService.getUserById(key).subscribe({
            next: (user) => this.displayValue = user.nombre,
            error: () => {}
        });
    }
}