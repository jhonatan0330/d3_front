import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DocumentoPlantillaDTO } from "app/document/document.types";
import { TemplateService } from "app/document/service/template.service";
import { NotificationsService } from 'app/notification/notification.api';
import { PlantillaHelper } from "app/shared/plantilla-helper";
import { NotificationCenterService } from 'app/notification/business/notification-center.service';
import { ActividadDTO } from "../../domain/ActividadDTO";
import { PropiedadDTO } from "app/shared/shared.domain";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from "@angular/material/autocomplete";
import { MatIcon } from "@angular/material/icon";
import { ImageFormatPipe } from "../../../shared/local-image";
import { UsersApi } from "app/users/users.api";
import { UsuarioDTO } from "app/users/domain/UsuarioDTO";

@Component({
    selector: 'transfer-form',
    templateUrl: './transfer-form.component.html',
    exportAs: 'transfer-form',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule,ReactiveFormsModule,MatFormField,MatInput,MatAutocompleteTrigger,MatAutocomplete,MatOption,MatIcon,ImageFormatPipe]
})
export class TransferFormComponent implements OnInit {
  private notificationService = inject(NotificationsService);
  private userApi = inject(UsersApi);
  private notificationCenter = inject(NotificationCenterService);
  private destroyRef = inject(DestroyRef);
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<TransferFormComponent>>(MatDialogRef);
  private templateService = inject(TemplateService);


  plantilla: DocumentoPlantillaDTO | null | undefined;
  isTransfering = false;
  transferForm = new FormGroup({
    responsable: new FormControl('', { validators: Validators.required, nonNullable: true }),
    comentario: new FormControl('', { validators: Validators.required, nonNullable: true }),
  });
  users: UsuarioDTO[] = [];

  ngOnInit(): void {

    this.plantilla = this.templateService.getTemplate(
      this.data.template
    );
    if (!this.plantilla || !this.plantilla.estados || this.plantilla.estados.length === 0) {
      this.notificationCenter.warn('No estados', 'Esta plantilla no tiene estados y no permite gestionar la transferencia');
      this.dialogRef.close(false);
      return;
    }

    let rolPropiedad: PropiedadDTO | null;
    for (let i = 0; i < this.plantilla.estados.length; i++) {
      const estadoModificable = this.plantilla.estados[i];
      if (estadoModificable.llaveTabla === this.data.state) {
        rolPropiedad = PlantillaHelper.buscarPropiedad(
          estadoModificable.propiedades,
          PlantillaHelper.ROL
        );
        if (!rolPropiedad) {
          this.notificationCenter.warn('No roles', 'El estado ' + estadoModificable.nombre + ' no tiene configurada la propiedad ROL');
          this.dialogRef.close(false);
          return;
        }
        break;
      }
    }

    const filter: ActividadDTO = new ActividadDTO();
    filter.documento = this.data.document;
    this.isTransfering = true;
      this.userApi.usersToTransfer(filter.documento!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (value) => {
        this.isTransfering = false;
        this.users = value;
        if (!value || value.length ===0) {
          this.notificationCenter.warn('No users', 'No tenemos usuarios en el rol ' + rolPropiedad!.texto + ' al cual puedas realizar la transferencia del documento');
          this.dialogRef.close(false);
          return;
        }       
      },
      error: () => {
        this.isTransfering = false;
      }
    });
  }

  transfer() {
    const transferData = this.transferForm.value as any;
    if (!transferData.responsable || !transferData.responsable.llaveTabla) {
      this.notificationCenter.info('Responsable', 'Selecciona el nuevo responsable');
    } else {
      const reasignacion: ActividadDTO = new ActividadDTO();
      reasignacion.documento = this.data.document;
      reasignacion.responsable = transferData.responsable.llaveTabla;
      reasignacion.comentario = transferData.comentario;
      this.isTransfering = true;
      this.notificationService.transfer(reasignacion)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.isTransfering = false;
        },
        error: () => {
          this.isTransfering = false;
        }
      });
    }
  }

  autoCompleteDisplayTransfer(item: UsuarioDTO): string {
    if (!item) {
      return '';
    }
    if (item.nombre) {
      return item.nombre;
    } else {
      return item.identificacion;
    }
  }
}