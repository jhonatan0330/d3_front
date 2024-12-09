import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/authorization/navigation/navigation.types';
import { NavigationService } from 'app/authorization/navigation/navigation.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { OrganizacionDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

@Component({
    selector: 'dense-layout',
    templateUrl: './dense.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DenseLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: UsuarioDTO;
    company: OrganizacionDTO;
    time = new Date();
    currentApplicationVersion = environment.appVersion;
    navigationAppearance: 'default' | 'dense' = 'dense';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _loginService: LoginService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _navigationService: NavigationService,
    ) {
    }

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

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');

                // Change the navigation appearance
                this.navigationAppearance = this.isScreenSmall ? 'default' : 'dense';
            });

        // Reloj
        setInterval(() => {
            this.time = new Date();
        }, 1000);
    }

    /**
     * On destroy
     */
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

    toggleNavigationAppearance(): void {
        this.navigationAppearance = (this.navigationAppearance === 'default' ? 'dense' : 'default');
    }

    openLogin() {
        this._loginService.isloginView = true;
    }
}
