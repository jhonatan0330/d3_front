import { Component, effect, OnDestroy, OnInit,  ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Navigation } from 'app/layout/navigation/navigation.types';
import { NavigationService } from 'app/layout/navigation/navigation.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';



import { ShortcutsComponent } from '../../../shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/notification-button/notification-button.component';
import { UserComponent } from '../../../user/user.component';
import { SimpleNavComponent } from '../../../simple-nav/simple-nav.component';
import { DatePipe } from '@angular/common';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatSidenav, MatSidenavContainer, MatSidenavContent, SimpleNavComponent, RouterLink, MatIcon,  ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, DatePipe, ImageFormatPipe]
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    _loginService = inject(LoginService);
    private _navigationService = inject(NavigationService);

    isScreenSmall = signal(false);
    sidenavOpened = signal(false);
    navigation: Navigation| null = null;
    user: UsuarioDTO | undefined;
    company: OrganizacionDTO | undefined;
    time = signal(new Date());
    currentApplicationVersion = environment.appVersion;
    private _mediaQuery = window.matchMedia('(min-width: 960px)');
    private _mediaHandler = (e: MediaQueryListEvent) => {
        this.isScreenSmall.set(!e.matches);
        this.sidenavOpened.set(e.matches);
    };
    private _clockInterval: ReturnType<typeof setInterval>;
    headerSection: string[];
    landing: string[];

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    constructor() {
        effect(() => {
            const user = this._loginService.user();
            this.user = (user && user.llaveTabla) ? user : undefined;
        });

        effect(() => {
            const company = this._loginService.company();
            this.company = (company && company.llaveTabla) ? company : undefined;
        });

        effect(() => {
            this.headerSection = this._loginService.headerSection();
        });

        effect(() => {
            this.landing = this._loginService.landing();
        });

        effect(() => {
            this.navigation = this._navigationService.navigation;
        });

        this.isScreenSmall.set(!this._mediaQuery.matches);
        this.sidenavOpened.set(this._mediaQuery.matches);
        this._mediaQuery.addEventListener('change', this._mediaHandler);
    }

    ngOnInit(): void {
        
        // Reloj
        this._clockInterval = setInterval(() => {
            this.time.set(new Date());
        }, 1000);
    }

    ngOnDestroy(): void {
        clearInterval(this._clockInterval);
        this._mediaQuery.removeEventListener('change', this._mediaHandler);
    }


    toggleNavigation(): void {
        // Toggle the opened status of the sidenav
        this.sidenavOpened.update((value) => !value);
    }

    closeNavOnSmall(): void {
        if (this.isScreenSmall()) {
            this.sidenavOpened.set(false);
        }
    }
}
