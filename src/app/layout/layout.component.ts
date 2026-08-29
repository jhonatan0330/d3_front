import { Component, effect, OnDestroy, OnInit, ChangeDetectionStrategy, inject, ViewEncapsulation, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FuseConfigService } from 'app/layout/core/config/fuse-config.service';
import { Layout } from 'app/layout/layout.types';
import { AppConfig } from 'app/layout/core/config/app.config';
import { LoginService } from 'app/authentication/login.service';
import { PlantillaHelper } from 'app/shared/plantilla-helper';
import { EmptyLayoutComponent } from './layouts/empty/empty.component';
import { CenteredLayoutComponent } from './layouts/horizontal/centered/centered.component';
import { EnterpriseLayoutComponent } from './layouts/horizontal/enterprise/enterprise.component';
import { MaterialLayoutComponent } from './layouts/horizontal/material/material.component';
import { ModernLayoutComponent } from './layouts/horizontal/modern/modern.component';
import { ClassicLayoutComponent } from './layouts/vertical/classic/classic.component';
import { ClassyLayoutComponent } from './layouts/vertical/classy/classy.component';
import { CompactLayoutComponent } from './layouts/vertical/compact/compact.component';
import { DenseLayoutComponent } from './layouts/vertical/dense/dense.component';
import { FuturisticLayoutComponent } from './layouts/vertical/futuristic/futuristic.component';
import { ThinLayoutComponent } from './layouts/vertical/thin/thin.component';

@Component({
    selector: 'layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [EmptyLayoutComponent, CenteredLayoutComponent, EnterpriseLayoutComponent, MaterialLayoutComponent, ModernLayoutComponent, ClassicLayoutComponent, ClassyLayoutComponent, CompactLayoutComponent, DenseLayoutComponent, FuturisticLayoutComponent, ThinLayoutComponent]
})
export class LayoutComponent implements OnInit {
    private _activatedRoute = inject(ActivatedRoute);
    private _router = inject(Router);
    private _fuseConfigService = inject(FuseConfigService);
    private _userService = inject(LoginService);
    private _destroyRef = inject(DestroyRef);

    config: AppConfig;
    layout: Layout;

    constructor() {
        effect(() => {
            const company = this._userService.company();
            if (company) {
                if (this.config) {
                    let layoutCompany: string = PlantillaHelper.buscarValor(company.propiedades, PlantillaHelper.LAYOUT_APP);
                    if (!layoutCompany) { layoutCompany = 'classy'; }
                    this.config.layout = layoutCompany as Layout;
                    this._updateLayout();
                }
            }
        });
    }

    ngOnInit(): void {
       
        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((config: AppConfig) => {
                // Store the config
                this.config = config;
                // Update the layout
                this._updateLayout();
            });
        // Subscribe to NavigationEnd event
        this._router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntilDestroyed(this._destroyRef)
        ).subscribe(() => {
            // Update the layout
            this._updateLayout();
        });


    }


    private _updateLayout(): void {
        // Get the current activated route
        let route = this._activatedRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }

        // 1. Set the layout from the config
        if (this.config) { this.layout = this.config.layout; }
        // 2. Get the query parameter from the current route and
        // set the layout and save the layout to the config
        const layoutFromQueryParam = (route.snapshot.queryParamMap.get('layout') as Layout);
        if (layoutFromQueryParam) {
            this.layout = layoutFromQueryParam;
            if (this.config) {
                this.config.layout = layoutFromQueryParam;
            }
        }

        const paths = route.pathFromRoot;
        paths.forEach((path) => {

            // Check if there is a 'layout' data
            if (path.routeConfig && path.routeConfig.data && path.routeConfig.data.layout) {
                // Set the layout
                this.layout = path.routeConfig.data.layout;
            }
        });
    }

}
