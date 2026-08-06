import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { environment } from 'environments/environment';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';
import { LoginService } from 'app/authentication/login.service';
import { SafeHtml } from '@angular/platform-browser';
import { FuseVerticalNavigationComponent as FuseVerticalNavigationComponent_1 } from '../../../../../@fuse/components/navigation/vertical/vertical.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HomeButtonComponent } from '../../../common/home-button/home-button.component';
import { SearchComponent } from '../../../common/search/search.component';
import { ShortcutsComponent } from '../../../common/shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/notification-button/notification-button.component';
import { UserComponent } from '../../../common/user/user.component';
import { FuseHorizontalNavigationComponent } from '../../../../../@fuse/components/navigation/horizontal/horizontal.component';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'enterprise-layout',
    templateUrl: './enterprise.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FuseVerticalNavigationComponent_1, MatIconButton, MatIcon, HomeButtonComponent, SearchComponent, ShortcutsComponent, NotificationButtonComponent, UserComponent, FuseHorizontalNavigationComponent, RouterOutlet, ImageFormatPipe]
})
export class EnterpriseLayoutComponent implements OnInit, OnDestroy {
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

    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to the user
        this._loginService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: UsuarioDTO) => {
                if (!user || !user.llaveTabla) {
                    this.user = undefined;
                    return;
                }
                this.user = user;
            });

        // Subscribe to the company
        this._loginService.company$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((company: OrganizacionDTO) => {
                if (!company || !company.llaveTabla) {
                    this.company = undefined;
                    return;
                }
                this.company = company;
            });
        this._loginService.headerSection$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((_header: []) => {
                this.headerSection = _header;
            });

        this._loginService.landing$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((_landing: []) => {
                this.landing = _landing;
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
