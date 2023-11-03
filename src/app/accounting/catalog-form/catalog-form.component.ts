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
    composeForm: UntypedFormGroup;
    loading = false;
    key: string;

    constructor(
        public matDialogRef: MatDialogRef<CatalogFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        this.composeForm = this._formBuilder.group({
            name: [''],
            code: [''],
            initialDate: [''],
            finalDate: ['']
        });


        if (!this.key) {
            this.accountingService.getCatalog(this.key)
                .subscribe(x => this.composeForm.patchValue(x));
        }
    }

    send(): void {
        this.loading = true;

        // stop here if form is invalid
        if (this.composeForm.invalid) {
            return;
        }

        this.loading = true;
        if (!this.key) {
            this.createUser();
        } else {
            this.updateUser();
        }

        
    }

    private createUser() {
        this.accountingService.createCatalog(this.composeForm.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    private updateUser() {
        this.matDialogRef.close();
    }

}
