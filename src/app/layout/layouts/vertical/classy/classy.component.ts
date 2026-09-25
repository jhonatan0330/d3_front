import { Component,  OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { NavigationService } from 'app/layout/navigation/navigation.service';
import { environment } from 'environments/environment';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ShortcutsComponent } from '../../../shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/components/notification-button/notification-button.component';
import { UserComponent } from '../../../user/user.component';
import { SimpleNavComponent } from '../../../simple-nav/simple-nav.component';
import { DatePipe } from '@angular/common';
import { ImageFormatPipe } from '../../../../shared/local-image';
import { SearchComponent } from 'app/layout/search/search.component';
import { TenantSwitcherComponent } from '../../../tenant/tenant-switcher.component';
import { LayoutService } from 'app/layout/layout.service';
import { CarouselService } from 'app/authentication/business/carousel.service';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    imports: [SimpleNavComponent, RouterLink, MatIcon, ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, DatePipe, ImageFormatPipe, SearchComponent, TenantSwitcherComponent]
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    readonly carouselService = inject(CarouselService);
    readonly layoutService = inject(LayoutService);
    private readonly navigationService = inject(NavigationService);

    readonly isScreenSmall = signal(false);
    readonly sidenavOpened = signal(false);
    readonly time = signal(new Date());


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

    hasUserImage(): boolean {
        return !!this.layoutService.user()?.imagen?.trim();
    }

    userInitial(): string {
        return this.layoutService.user()?.nombre?.charAt(0)?.toUpperCase() ?? '';
    }

    onUserImageError(event: Event): void {
        (event.target as HTMLImageElement).style.display = 'none';
    }

    closeNavOnSmall(): void {
        if (this.isScreenSmall()) {
            this.sidenavOpened.set(false);
        }
    }
}
