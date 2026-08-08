import { Component, effect, OnDestroy, OnInit,  ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { environment } from 'environments/environment';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { SafeHtml } from '@angular/platform-browser';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { HomeButtonComponent } from '../../../common/home-button/home-button.component';
import { SearchComponent } from '../../../common/search/search.component';
import { ShortcutsComponent } from '../../../common/shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/notification-button/notification-button.component';
import { UserComponent } from '../../../common/user/user.component';
import { SimpleNavComponent } from '../../../common/simple-nav/simple-nav.component';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'modern-layout',
    templateUrl: './modern.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatSidenav, MatSidenavContainer, MatSidenavContent, SimpleNavComponent, MatIconButton, MatIcon, HomeButtonComponent, SearchComponent, ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, ImageFormatPipe]
})
export class ModernLayoutComponent implements OnInit, OnDestroy {
    _loginService = inject(LoginService);
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
    private _navigationService = inject(NavigationService);

    isScreenSmall: boolean;
    sidenavOpened = false;
    navigation: Navigation;
    user: UsuarioDTO;
    company: OrganizacionDTO;
    time = signal(new Date());
    currentApplicationVersion = environment.appVersion;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    headerSection: SafeHtml[];
    landing: SafeHtml[];

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
    }

    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');

                // Open the sidenav on larger screens, close it on small screens
                this.sidenavOpened = !this.isScreenSmall;
            });

        // Reloj
        setInterval(() => {
            this.time.set(new Date());
        }, 1000);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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
