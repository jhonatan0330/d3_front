import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountingService } from '../accounting.service';
import { Observable, Subscription, debounceTime, pairwise, startWith, map } from 'rxjs';
import { AccountDTO, ManualAccountDTO } from '../accounting.domain';
import Swal from 'sweetalert2';

@Component({
    selector: 'account-manual-form',
    templateUrl: './manual-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ManualFormComponent implements OnInit {

    public form: UntypedFormGroup;
    public timeFrom: FormControl = new FormControl('00:00'); // Controlador del texto de la hora
    public loading = false;
    public filteredOptions: Observable<AccountDTO[]>;
    public debitValue: number = 0;
    public differenceValue: number = 0;
    private creditValue: number = 0;

    private key: string;
    private subscription: Subscription;
    botonAccion: string = "Guardar";

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<ManualFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        public accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        if (!this.accountingService.currentCatalog) {
            this.matDialogRef.close();
            return;
        }

        this.form = this._formBuilder.group({
            header: this._formBuilder.group({
                catalog: this.accountingService.currentCatalog.key,
                concept: ['', Validators.required],
                type: ['', Validators.required],
                factDate: [new Date(), Validators.required],
                value: 0
            }),
            records: this._formBuilder.array([], Validators.required)
        });
        this.getAccounts();

        if(this.data) {
            this.botonAccion = "Actualizar";
            this.key = this.data;
            this.loading= true;
            this.accountingService.getVoucher( this.data)
            .subscribe(x => {

                this.form = this._formBuilder.group({
                    header: this._formBuilder.group({
                        catalog: this.accountingService.currentCatalog.key,
                        concept: [x.header.concept],
                        factDate: [x.header.factDate],
                        value: [x.header.value]
                    }),
                    records: this._formBuilder.array([], Validators.required)
                });

                x.records.forEach(i => {
                    i.accountDTO = new AccountDTO();
                    i.accountDTO.name = i.accountName;
                    i.accountDTO.code = i.accountCode;
                    i.accountDTO.key = i.account;
                    this.creditValue += i.negative;
                    this.debitValue += i.positive;
                    this.recordsArray.push(this.createRecord(i));
                })
                this.differenceValue = this.debitValue - this.creditValue;
                this.recordsArray.push(this.createRecord(new ManualAccountDTO()));
                this.loading= false;
            });
        }
        else {
            this.recordsArray.push(this.createRecord(new ManualAccountDTO()));
        }

        //this.data.forEach(() => this.addRow());
        //this.updateView();

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

        this.timeFrom.valueChanges.subscribe({
            next: () => {
                let dateFact:Date = this.form.get('header').get('factDate').value;
                dateFact.setHours(this.timeFrom.value.substring(0, 2));
                dateFact.setMinutes(this.timeFrom.value.substring(3, 5));
                dateFact.setSeconds(0);
                this.form.get('header').get('factDate').setValue(dateFact);
            },
          });
    }

    getAccounts() {
        if (!this.accountingService.currentCatalog.accounts) {
            this.loading = true;
            this.accountingService.getAccounts(this.accountingService.currentCatalog.key).subscribe({
                next: (items) => {
                    this.accountingService.currentCatalog.accounts = items;
                    this.loading = false;
                }, error: () => {
                    this.loading = false;
                }
            });
        }
    }

    displayFn(acc: AccountDTO): string {
        if (!acc || !acc.key) return '';
        return acc.code + ' | ' + acc.name;
    }

    send(): void {
        if (this.creditValue !== this.debitValue) {
            Swal.fire('', 'El valor crédito (' + this.creditValue + ') no es igual al valor debito (' + this.debitValue + ')');
            return;
        }

        if (this.creditValue === 0) {
            Swal.fire('Completa el comprobante', 'Debes colocar valores en los asientos contables');
            return;
        }

        if (this.creditValue === 0) {
            Swal.fire('Completa el comprobante', 'Debes colocar valores en los asientos contables');
            return;
        }

        if (!this.form.get('header').get('concept').value) {
            Swal.fire('Completa el comprobante', 'Debes colocar El concepto');
            return;
        }

        if (!this.form.get('header').get('factDate').value) {
            Swal.fire('Completa el comprobante', 'Que no se te olvide la fecha');
            return;
        }

        //Por el momento dejo las validaciones en back pero toca mejorar esto para evitar consultas innecesarias
        /*if (this.form.invalid) {
            return;
        }*/
        this.loading = true;
        if (!this.key) {
            this.create();
        } else {
            this.update();
        }
    }

    private create() {
        this.accountingService.createManual(this.form.value)
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    private update() {
        this.accountingService.updateManual(this.form.value)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
    }

    createRecord(manualaccount:ManualAccountDTO): FormGroup {

        if(!manualaccount.accountDTO)
            manualaccount.accountDTO = new AccountDTO();

        if(!manualaccount.positive)
            manualaccount.positive = 0;

        if(!manualaccount.negative)
            manualaccount.negative = 0;

        if(!manualaccount.account)
            manualaccount.account = "";

        const group = this._formBuilder.group(manualaccount);

        if (manualaccount.positive && group.get('negative').enabled)
        {
            group.get('negative').disable();
        }
        if (manualaccount.negative && group.get('positive').enabled)
        {
            group.get('positive').disable();
         }

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        group.get('accountDTO').valueChanges.subscribe(
            (value) => {
                if (!value || !value.key) {
                    group.get('accountName').setValue('');
                    group.get('account').setValue('');
                    return;
                }
                const account = this.accountingService.currentCatalog.accounts.find(item => item.key === value.key);
                if (!account) {
                    group.get('accountName').setValue('');
                    group.get('account').setValue('');
                    if(!value.key && value.indexOf("|")!==-1) group.get('accountDTO').setValue('');
                    return;
                }
                group.get('account').setValue(account.key);
                group.get('accountName').setValue(account.code + ' | ' + account.name);
            }
        )

        group.get('positive').valueChanges
            .pipe(
                startWith(manualaccount.positive),
                pairwise())
            .subscribe(
                ([prevValue, selectedValue]) => {
                    this.debitValue -= prevValue;
                    this.debitValue += selectedValue;
                    this.form.get('header').get('value').setValue(this.debitValue);
                    this.differenceValue = this.debitValue - this.creditValue;
                    if (selectedValue !== 0) {
                        group.get('negative').disable();
                    } else {
                        if (!group.get('negative').enabled) { group.get('negative').enable(); }
                    }
                }
            );

        group.get('negative').valueChanges
            .pipe(
                startWith(manualaccount.negative),
                pairwise())
            .subscribe(
                ([prevValue, selectedValue]) => {
                    this.creditValue -= prevValue;
                    this.creditValue += selectedValue;
                    this.differenceValue = this.debitValue - this.creditValue;
                    if (selectedValue !== 0) {
                        group.get('positive').disable();
                    } else {
                        if (!group.get('positive').enabled) { group.get('positive').enable(); }
                    }
                }
            );

        if (this.differenceValue !== 0) {
            if (this.differenceValue > 0) {
                group.get('negative').setValue(this.differenceValue);
            } else {
                group.get('positive').setValue(this.differenceValue * -1);
            }
        }

        this.subscription = group.valueChanges.pipe(
            debounceTime(1000)).subscribe(item => {
                if (item.account && (item.positive !== 0 || item.negative !== 0)) {
                    this.recordsArray.push(this.createRecord(new ManualAccountDTO()));
                }
            });

        this.filteredOptions = group.get('accountDTO').valueChanges.pipe(
            startWith(''),
            map(value => this.filterAccount(value))
        );
        return group;
    }

    public filterAccount(value): AccountDTO[] {
        if(! this.accountingService || !this.accountingService.currentCatalog || !this.accountingService.currentCatalog.accounts) return [];
        if (!value) { return this.accountingService.currentCatalog.accounts.filter(acc => acc.type === 'O' )}
        if ( value.key){ return [];}
        const filterValue = value.toLowerCase();
        return this.accountingService.currentCatalog.accounts.filter(acc => (acc.type === 'O' && (acc.name.toLowerCase().includes(filterValue) || acc.code.toLowerCase().includes(filterValue))));
    }

    get recordsArray(): FormArray {
        return <FormArray>this.form.get('records');
    }

}
