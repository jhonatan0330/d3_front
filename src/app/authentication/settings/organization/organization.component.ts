import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OrganizacionDTO } from 'app/authentication/authentication.domain';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { PropertyService } from 'app/authentication/property.service';
import { PropiedadDTO, PropiedadValorDefinidoDTO } from 'app/shared/shared.domain';
import { Observable, debounceTime } from 'rxjs';
import { PropertyForm } from '../property-form/property-form.component';


@Component({
  selector: 'settings-organization',
  templateUrl: './organization.component.html'
})
export class SettingsOrganizationComponent {

  organization: OrganizacionDTO = new OrganizacionDTO();
  properties = [];
  form: UntypedFormGroup;

  types: PropiedadValorDefinidoDTO[] = [];
  fControl = new UntypedFormControl();

  constructor(
    private _matDialog: MatDialog,
    private _formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private propertyService: PropertyService
  ) {
  }

  ngOnInit(): void {

    // Create the form
    this.form = this._formBuilder.group({
      nombre: [''],
      servidor: [''],
      usuarioSystem: [''],
      imagen: [''],
      slogan: [''],
      mensajeIngreso: [''],
      codigo: ['']
    });

    this.form.disable();


    this.authenticationService.getOrganization().subscribe({
      next: (value: OrganizacionDTO) => {
        this.organization = value;
        this.form.patchValue(value);
        this.form.enable();
        this.getProperties();
      },
      error: () => { }
    });

    this.fControl.valueChanges.pipe(debounceTime(1000)).subscribe(item => {
      if (item && item.llaveTabla) {
        this.openPropertyForm(item);
      } else {
        this.getTypeProperty();
      }

    });

  }

  getProperties() {
    if (!this.organization || !this.organization.llaveTabla) { return; }
    this.propertyService.getProperties('O', this.organization.llaveTabla).subscribe({
      next: (value: PropiedadDTO[]) => {
        this.properties = value;
      }
    });
  }

  getTypeProperty() {
    this.propertyService.getTypes('O', this.fControl.value).subscribe({
      next: (value: PropiedadValorDefinidoDTO[]) => {
        this.types = value;
      }
    });
  }

  displayFn(acc: PropiedadValorDefinidoDTO): string {
    if (!acc) return '';
    return acc.nombre;
  }

  openPropertyForm(item: PropiedadValorDefinidoDTO): void {
    if (!item) { return; }
    this.propertyService.selectedType = item;
    const dialogRef = this._matDialog.open(PropertyForm, {
      data: { type: item },
      maxHeight: '90vh',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => { this.getProperties(); });
  }

}