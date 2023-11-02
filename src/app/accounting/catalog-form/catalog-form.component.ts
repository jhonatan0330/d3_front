import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'account-catalog-form',
    templateUrl: './catalog-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CatalogFormComponent implements OnInit {
    composeForm: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<CatalogFormComponent>,
        private _formBuilder: UntypedFormBuilder,
    ) {
    }

    ngOnInit(): void {
        this.composeForm = this._formBuilder.group({
            name: [''],
            code: [''],
            initialDate: [''],
            finalDate: ['']
        });
    }

    saveAndClose(): void {
        this.matDialogRef.close();
    }

}
