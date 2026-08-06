import { NgModule, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@NgModule()
export class IconsModule
{
    private _domSanitizer = inject(DomSanitizer);
    private _matIconRegistry = inject(MatIconRegistry);

    /**
     * Constructor
     */
    constructor()
    {
        // Register icon sets
        //this._matIconRegistry.addSvgIconSet(this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/material-twotone.svg'));
        this._matIconRegistry.addSvgIconSetInNamespace('heroicons_outline', this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-outline.svg'));
    }
}
