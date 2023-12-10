import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DocumentoPlantillaDTO } from "app/modules/full/neuron/model/sw42.domain";
import { TemplateService } from "app/modules/full/neuron/service/template.service";
import { NotificationsService } from 'app/notification/notification.service';
import { PlantillaHelper } from "app/shared/plantilla-helper";
import Swal from 'sweetalert2';
import { ActividadDTO } from "../notification.types";
import { PropiedadDTO } from "app/shared/shared.domain";
import { UsuarioDTO } from "app/authentication/authentication.domain";

@Component({
  selector: 'transfer-form',
  templateUrl: './transfer-form.component.html',
  exportAs: 'transfer-form'
})
export class TransferFormComponent implements OnInit {

  plantilla: DocumentoPlantillaDTO; // Contiene la estructura del formulario
  isTransfering = false;
  transferForm: FormGroup = new FormGroup({
    responsable: new FormControl('', Validators.required),
    comentario: new FormControl('', Validators.required),
  });
  users: UsuarioDTO[] = [];

  constructor(
    private notificationService: NotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TransferFormComponent>,
    private templateService: TemplateService
  ) {

  }

  ngOnInit(): void {

    this.plantilla = this.templateService.getTemplate(
      this.data.template, this.data.server
    );
    if (!this.plantilla || !this.plantilla.estados || this.plantilla.estados.length === 0) {
      Swal.fire('No estados', 'Esta plantilla no tiene estados y no permite gestionar la transferencia', 'warning');
      this.dialogRef.close(false);
      return;
    }

    let rolPropiedad: PropiedadDTO;
    for (let i = 0; i < this.plantilla.estados.length; i++) {
      const estadoModificable = this.plantilla.estados[i];
      if (estadoModificable.llaveTabla === this.data.state) {
        rolPropiedad = PlantillaHelper.buscarPropiedad(
          estadoModificable.propiedades,
          PlantillaHelper.ROL
        );
        if (!rolPropiedad) {
          Swal.fire('No roles', 'El estado ' + estadoModificable.nombre + ' no tiene configurada la propiedad ROL', 'warning');
          this.dialogRef.close(false);
          return;
        }
        break;
      }
    }

    const filter: ActividadDTO = new ActividadDTO();
    filter.documento = this.data.document;
    this.isTransfering = true;
    this.notificationService.usersToTransfer(filter, this.plantilla.server).subscribe({
      next: (value) => {
        this.isTransfering = false;
        this.users = value;
        if (!value || value.length ===0) {
          Swal.fire('No users', 'No tenemos usuarios en el rol ' + rolPropiedad.texto + ' al cual puedas realizar la transferencia del documento', 'warning');
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
    const transferData = this.transferForm.value;
    if (!transferData.responsable || !transferData.responsable.llaveTabla) {
      Swal.fire('Responsable', 'Selecciona el nuevo responsable', 'info');
    } else {
      const reasignacion: ActividadDTO = new ActividadDTO();
      reasignacion.documento = this.data.document;
      reasignacion.responsable = transferData.responsable.llaveTabla;
      reasignacion.comentario = transferData.comentario;
      this.isTransfering = true;
      this.notificationService.transfer(reasignacion, this.plantilla.server).subscribe({
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