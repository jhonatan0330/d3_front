import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountingService } from '../accounting.service';
import { Observable, Subscription, debounceTime, pairwise, startWith, map } from 'rxjs';
import { AccountDTO, CatalogDTO, ManualAccountAuxiliarDTO, ManualAccountDTO, VoucherLine } from '../accounting.domain';
import Swal from 'sweetalert2';
import { TemplateService } from 'app/modules/full/neuron/service/template.service';
import { ReporteBaseDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { LocalConstants, LocalStoreService } from 'app/shared/local-store.service';

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
    public codigoComprobante = '';
    private creditValue: number = 0;


    private key: string;
    private subscription: Subscription;
    botonAccion: string = "Guardar";

    private catalog: CatalogDTO;
    public referencesActive: boolean = false;
    public reportes: ReporteBaseDTO[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<ManualFormComponent>,
        private _formBuilder: UntypedFormBuilder,
        public accountingService: AccountingService,
        private ls: LocalStoreService,
        private templateService: TemplateService
        
    ) {
    }

    ngOnInit(): void {

        this.form = this._formBuilder.group({
            header: this._formBuilder.group({
                catalog: (this.accountingService.currentCatalog) ? this.accountingService.currentCatalog.key : '',
                concept: ['', Validators.required],
                type: ['', Validators.required],
                factDate: [new Date(), Validators.required],
                value: 0
            }),
            records: this._formBuilder.group({
                line: this._formBuilder.array([], Validators.required),
                references: this.createreferenceArray([])
            })
        });
        this.getAccounts();

        if (this.data) {
            if (this.data.catalogId) {
                this.accountingService.getCatalog(this.data.catalogId).subscribe((catalog) => {
                    this.catalog = catalog;
                    this.getReports();
                });
                this.botonAccion = "Actualizar";
            } else {
                this.botonAccion = undefined;
            }
            this.key = this.data.key;
            this.loading = true;
            this.accountingService.getVoucher(this.data.key)
                .subscribe(x => {

                    this.form = this._formBuilder.group({
                        header: this._formBuilder.group(x.header),
                        records: this._formBuilder.array([], Validators.required)
                    });

                    this.timeFrom.setValue(x.header.factDate.getHours() + ':' + x.header.factDate.getMinutes());

                    x.records.forEach(i => {
                        i.line.accountDTO = new AccountDTO();
                        i.line.accountDTO.name = i.line.accountName;
                        i.line.accountDTO.code = i.line.accountCode;
                        i.line.accountDTO.key = i.line.account;
                        this.creditValue += i.line.negative;
                        this.debitValue += i.line.positive;
                        this.recordsArray.push(this.createRecord(i));
                    })
                    this.codigoComprobante = x.header.code;
                    this.differenceValue = this.debitValue - this.creditValue;
                    if (this.data.catalogId) { this.recordsArray.push(this.createRecord(new VoucherLine())); }
                    this.loading = false;
                });
        }
        else {
            this.recordsArray.push(this.createRecord(new VoucherLine()));
        }

        this.timeFrom.valueChanges.subscribe({
            next: () => {
                let dateFact: Date = this.form.get('header').get('factDate').value;
                dateFact.setHours(this.timeFrom.value.substring(0, 2));
                dateFact.setMinutes(this.timeFrom.value.substring(3, 5));
                dateFact.setSeconds(0);
                this.form.get('header').get('factDate').setValue(dateFact);
            },
        });
    }

    createreferenceArray(pItems: ManualAccountAuxiliarDTO[]): FormArray {
        const resultList = this._formBuilder.array([], Validators.required);
        for (let i = 0; i < pItems.length; i++) {
            resultList.push(this._formBuilder.group(pItems[i]));
        }
        return resultList;
    }

    getAccounts() {
        if (this.accountingService.currentCatalog && !this.accountingService.currentCatalog.accounts) {
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

    createRecord(manualaccount: VoucherLine): FormGroup {

        if (!manualaccount.line) manualaccount.line = new ManualAccountDTO();
        if (!manualaccount.references) manualaccount.references = [];
        if (!manualaccount.line.accountDTO)
            manualaccount.line.accountDTO = new AccountDTO();

        if (!manualaccount.line.positive)
            manualaccount.line.positive = 0;

        if (!manualaccount.line.negative)
            manualaccount.line.negative = 0;

        if (!manualaccount.line.account)
            manualaccount.line.account = "";

        const group = this._formBuilder.group({
            line: this._formBuilder.group(manualaccount.line),
            references: this.createreferenceArray(manualaccount.references)
        });

        if (manualaccount.line.positive && group.get('line').get('negative').enabled) {
            group.get('line').get('negative').disable();
        }
        if (manualaccount.line.negative && group.get('line').get('positive').enabled) {
            group.get('line').get('positive').disable();
        }

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        group.get('line').get('accountDTO').valueChanges.subscribe(
            (value) => {
                if (!value || !value.key) {
                    group.get('line').get('accountName').setValue('');
                    group.get('line').get('account').setValue('');
                    return;
                }
                const account = this.accountingService.currentCatalog.accounts.find(item => item.key === value.key);
                if (!account) {
                    group.get('line').get('accountName').setValue('');
                    group.get('line').get('account').setValue('');
                    if (!value.key && value.indexOf("|") !== -1) group.get('line').get('accountDTO').setValue('');
                    return;
                }
                group.get('line').get('account').setValue(account.key);
                group.get('line').get('accountName').setValue(account.code + ' | ' + account.name);
            }
        )

        group.get('line').get('positive').valueChanges
            .pipe(
                startWith(manualaccount.line.positive),
                pairwise())
            .subscribe(
                ([prevValue, selectedValue]) => {
                    this.debitValue -= prevValue;
                    this.debitValue += selectedValue;
                    this.form.get('header').get('value').setValue(this.debitValue);
                    this.differenceValue = this.debitValue - this.creditValue;
                    if (selectedValue !== 0) {
                        group.get('line').get('negative').disable();
                    } else {
                        if (!group.get('line').get('negative').enabled) { group.get('line').get('negative').enable(); }
                    }
                }
            );

        group.get('line').get('negative').valueChanges
            .pipe(
                startWith(manualaccount.line.negative),
                pairwise())
            .subscribe(
                ([prevValue, selectedValue]) => {
                    this.creditValue -= prevValue;
                    this.creditValue += selectedValue;
                    this.differenceValue = this.debitValue - this.creditValue;
                    if (selectedValue !== 0) {
                        group.get('line').get('positive').disable();
                    } else {
                        if (!group.get('line').get('positive').enabled) { group.get('line').get('positive').enable(); }
                    }
                }
            );

        if (this.differenceValue !== 0) {
            if (this.differenceValue > 0) {
                group.get('line').get('negative').setValue(this.differenceValue);
            } else {
                group.get('line').get('positive').setValue(this.differenceValue * -1);
            }
        }

        this.subscription = group.valueChanges.pipe(
            debounceTime(1000)).subscribe(item => {
                if (item.account && (item.positive !== 0 || item.negative !== 0)) {
                    this.recordsArray.push(this.createRecord(new VoucherLine()));
                }
            });

        this.filteredOptions = group.get('line').get('accountDTO').valueChanges.pipe(
            startWith(''),
            map(value => this.filterAccount(value))
        );
        return group;
    }

    public filterAccount(value): AccountDTO[] {
        if (!this.accountingService || !this.accountingService.currentCatalog || !this.accountingService.currentCatalog.accounts) return [];
        if (!value) { return this.accountingService.currentCatalog.accounts.filter(acc => acc.type === 'O') }
        if (value.key) { return []; }
        const filterValue = value.toLowerCase();
        return this.accountingService.currentCatalog.accounts.filter(acc => (acc.type === 'O' && (acc.name.toLowerCase().includes(filterValue) || acc.code.toLowerCase().includes(filterValue))));
    }

    get recordsArray(): FormArray {
        return <FormArray>this.form.get('records');
    }

    auxiliares(lineIndex: number): FormArray {
        return this.recordsArray.at(lineIndex).get('references') as FormArray;
    }

    getReports() {
        if (!this.catalog) return;
        const _template = this.templateService.getTemplate(this.catalog.template, null);
        if (!_template || !_template.reportes || _template.reportes.length === 0) return;
        for (let i = 0; i < _template.reportes.length; i++) {
            this.reportes.push(_template.reportes[i]);
        }
    }

    printReport() {
         for (let r = 0; r < this.reportes.length; r++) {
                const _report = this.reportes[r];
                  this.showReport(_report);
                
              }
            }

    showReport(reporte: ReporteBaseDTO) {
        if (!reporte) {
          return;
        }
        let stringURL = reporte.servidorUrl;
        if (!stringURL) {
          stringURL = this.ls.getItem(LocalConstants.URL_CONF);
        }
        stringURL =
          stringURL +
          '/reporte?nombre=' +
          reporte.llaveTabla +
          '&P_KEY=' +
          this.key +
          '&P_TOKEN=' +
          this.templateService.getTokenConnection(stringURL);
    
        if (reporte.variables) {
          stringURL = stringURL + '&' + reporte.variables;
        }
        window.open(stringURL, '_blank');
      }

}
