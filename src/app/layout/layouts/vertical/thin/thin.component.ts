import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { NavigationService } from 'app/layout/navigation/navigation.service';
import { environment } from 'environments/environment';
import { MatIcon } from '@angular/material/icon';
import { ShortcutsComponent } from '../../../shortcuts/shortcuts.component';
import { NotificationButtonComponent } from '../../../../notification/components/notification-button/notification-button.component';
import { UserComponent } from '../../../user/user.component';
import { SimpleNavComponent } from '../../../simple-nav/simple-nav.component';
import { RouterOutlet } from '@angular/router';
import { ImageFormatPipe } from '../../../../shared/local-image';
import { CarouselService } from 'app/authentication/business/carousel.service';
import { LayoutService } from 'app/layout/layout.service';

@Component({
    selector: 'thin-layout',
    templateUrl: './thin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SimpleNavComponent, MatIcon,  ShortcutsComponent, NotificationButtonComponent, UserComponent, RouterOutlet, ImageFormatPipe]
})
export class ThinLayoutComponent implements OnInit, OnDestroy {
    public readonly layoutService = inject(LayoutService);
    readonly carouselService = inject(CarouselService);
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

    closeNavOnSmall(): void {
        if (this.isScreenSmall()) {
            this.sidenavOpened.set(false);
        }
    }

}
