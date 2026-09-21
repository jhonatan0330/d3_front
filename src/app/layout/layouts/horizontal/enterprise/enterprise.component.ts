import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationService } from 'app/layout/navigation/navigation.service';
import { environment } from 'environments/environment';
import { LoginService } from 'app/authentication/login.service';
import { MatIcon } from '@angular/material/icon';



import { ShortcutsComponent } from '../../../shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/components/notification-button/notification-button.component';
import { UserComponent } from '../../../user/user.component';
import { SimpleNavComponent } from '../../../simple-nav/simple-nav.component';
import { ImageFormatPipe } from '../../../../shared/local-image';

@Component({
    selector: 'enterprise-layout',
    templateUrl: './enterprise.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SimpleNavComponent, MatIcon,  ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, ImageFormatPipe]
})
export class EnterpriseLayoutComponent implements OnInit, OnDestroy {
    readonly loginService = inject(LoginService);
    private readonly navigationService = inject(NavigationService);

    readonly isScreenSmall = signal(false);
    readonly sidenavOpened = signal(false);
    readonly time = signal(new Date());

    readonly user = this.loginService.user;
    readonly company = this.loginService.company;
    readonly headerSection = this.loginService.headerSection;
    readonly landing = this.loginService.landing;

    readonly navigation = this.navigationService.navigation;

    readonly currentApplicationVersion = environment.appVersion;

    private readonly mediaQuery = window.matchMedia('(min-width: 960px)');
    private readonly mediaHandler = (e: MediaQueryListEvent) => {
        this.isScreenSmall.set(!e.matches);
        this.sidenavOpened.set(e.matches);
    };
    private clockInterval: ReturnType<typeof setInterval>;

    constructor() {
        this.isScreenSmall.set(!this.mediaQuery.matches);
        this.sidenavOpened.set(this.mediaQuery.matches);
        this.mediaQuery.addEventListener('change', this.mediaHandler);
    }

    ngOnInit(): void {
        this.clockInterval = setInterval(() => { this.time.set(new Date()); }, 1000);
    }

    ngOnDestroy(): void {
        clearInterval(this.clockInterval);
        this.mediaQuery.removeEventListener('change', this.mediaHandler);
    }

    toggleNavigation(): void {
        this.sidenavOpened.update((value) => !value);
    }

    closeNavOnSmall(): void {
        if (this.isScreenSmall()) {
            this.sidenavOpened.set(false);
        }
    }

}
