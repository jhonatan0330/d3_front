import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountingService } from '../accounting.service';

@Component({
    selector: 'account-catalog-form',
    templateUrl: './catalog-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CatalogFormComponent implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    key: string;

    constructor(
        public matDialogRef: MatDialogRef<CatalogFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            name: [''],
            code: [''],
            initialDate: [''],
            finalDate: ['']
        });


        if (!this.key) {
            this.accountingService.getCatalog(this.key)
                .subscribe(x => this.form.patchValue(x));
        }
    }

    send(): void {
        this.loading = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (!this.key) {
            this.create();
        } else {
            this.update();
        }

        
    }

    private create() {
        this.accountingService.createCatalog(this.form.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    private update() {
        this.matDialogRef.close();
    }

}
