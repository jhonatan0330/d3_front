import { Component, effect, OnDestroy, OnInit,  ChangeDetectionStrategy, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { SafeHtml } from '@angular/platform-browser';
import { FuseVerticalNavigationComponent as FuseVerticalNavigationComponent_1 } from '../../../../../@fuse/components/navigation/vertical/vertical.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { HomeButtonComponent } from '../../../common/home-button/home-button.component';
import { SearchComponent } from '../../../common/search/search.component';
import { ShortcutsComponent } from '../../../common/shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/notification-button/notification-button.component';
import { UserComponent } from '../../../common/user/user.component';
import { DatePipe } from '@angular/common';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'classic-layout',
    templateUrl: './classic.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FuseVerticalNavigationComponent_1, RouterLink, MatIcon, MatIconButton, HomeButtonComponent, SearchComponent, ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, DatePipe, ImageFormatPipe]
})
export class ClassicLayoutComponent implements OnInit, OnDestroy {
    _loginService = inject(LoginService);
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
    private _fuseNavigationService = inject(FuseNavigationService);
    private _navigationService = inject(NavigationService);

    isScreenSmall: boolean;
    navigation: Navigation;
    user: UsuarioDTO;
    company: OrganizacionDTO;
    time = new Date();
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
            });

        // Reloj
        setInterval(() => {
            this.time = new Date();
        }, 1000);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

}
