import { Component, effect, OnDestroy, OnInit,  ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';

import { SearchComponent } from '../../../common/search/search.component';
import { ShortcutsComponent } from '../../../common/shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/notification-button/notification-button.component';
import { UserComponent } from '../../../common/user/user.component';
import { SimpleNavComponent } from '../../../common/simple-nav/simple-nav.component';
import { RouterOutlet } from '@angular/router';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'thin-layout',
    templateUrl: './thin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatSidenav, MatSidenavContainer, MatSidenavContent, SimpleNavComponent, MatIconButton, MatIcon, SearchComponent, ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, ImageFormatPipe]
})
export class ThinLayoutComponent implements OnInit, OnDestroy {
    _loginService = inject(LoginService);
    private _navigationService = inject(NavigationService);

    isScreenSmall: boolean;
    sidenavOpened = false;
    navigation: Navigation;
    user: UsuarioDTO | undefined;
    company: OrganizacionDTO | undefined;
    time = signal(new Date());
    currentApplicationVersion = environment.appVersion;
    private _mediaQuery = window.matchMedia('(min-width: 960px)');
    private _mediaHandler = (e: MediaQueryListEvent) => {
        this.isScreenSmall = !e.matches;
        this.sidenavOpened = e.matches;
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
    }

    ngOnInit(): void {
        this.isScreenSmall = !this._mediaQuery.matches;
        this.sidenavOpened = this._mediaQuery.matches;
        this._mediaQuery.addEventListener('change', this._mediaHandler);

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
        this.sidenavOpened = !this.sidenavOpened;
    }

    closeNavOnSmall(): void {
        if (this.isScreenSmall) {
            this.sidenavOpened = false;
        }
    }

}
