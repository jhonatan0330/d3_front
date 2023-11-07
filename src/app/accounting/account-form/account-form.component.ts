import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountingService } from '../accounting.service';
import { Observable } from 'rxjs';
import { AccountDTO } from '../accounting.domain';

@Component({
    selector: 'account-account-form',
    templateUrl: './account-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AccountFormComponent implements OnInit {

    form: UntypedFormGroup;
    loading = false;
    key: string;
    filteredOptions: Observable<AccountDTO[]>;

    private catalogId: string;
    private parentId: string;


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<AccountFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        if (!this.data || !this.data.catalogId) { 
            this.matDialogRef.close();
            return; 
        }
        this.catalogId = this.data.catalogId;
        this.parentId = this.data.parentId;
        this.form = this._formBuilder.group({
            catalog: this.catalogId,
            name: [''],
            code: [''],
            parent: this.parentId
        });

       /* this.form.controls['parent'].valueChanges
            .pipe(
                debounceTime(500)
            )
            .subscribe((text)=>{
                let textFilter = text;
                if(text.key){ return; }
                this.filteredOptions = this.accountingService.getAccounts(this.catalogId, text);
            });*/

        if (!this.key) {
            this.accountingService.getCatalog(this.key)
                .subscribe(x => this.form.patchValue(x));
        }
    }

    /*displayFn(account: AccountDTO): string {
        return account && account.name ? account.name : '';
      }*/

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
        this.accountingService.createAccount(this.form.value)
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