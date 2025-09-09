import {
    Component,
    OnInit
} from '@angular/core';
import { ContactsService } from '../contact.services';
import { RolAccesoFilterDTO, UsuarioDTO } from 'app/authentication/authentication.domain';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { LoginService } from 'app/authentication/login.service';
import { UtilsService } from 'app/modules/full/neuron/service/utils.service';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';

@Component({
    selector: 'contacts-details',
    templateUrl: 'detail_person.html'
})
export class ContactsDetailsComponent implements OnInit {

   
    public contact: UsuarioDTO = new UsuarioDTO();
    isSameUser: boolean;

    tags: RolAccesoFilterDTO[];


    constructor(
        private _contactsService: ContactsService,
        @Inject(MAT_DIALOG_DATA) public data: { key: string;},
        private dialogRef: MatDialogRef<ContactsDetailsComponent>,
        public jwtAuth: LoginService,
        private utilService:UtilsService,
        
    ) {}

    ngOnInit(): void {
        

        this._contactsService.getContactById(this.data.key).subscribe((contact: UsuarioDTO) => {
            this.contact = contact;
            this.isSameUser = (this.jwtAuth.getUser().llaveTabla === contact.llaveTabla);
        });
    }


    trackByFn(index: number, item: any): any {
        return item.identificacion || index;
    }

    cerrar() {
        this.dialogRef.close();
    }

    abrirRol(tag:RolAccesoFilterDTO){
        const componente = new PedidoVentaDTO; 
        componente.llaveTabla = tag.codigo;
        componente.plantilla = tag.plantilla;
        componente.server = undefined;
        this.utilService.modalWithParams(componente );
    }

    buscartags(){
        this._contactsService.searchTagsById(this.data.key).subscribe({
                next: (_value: RolAccesoFilterDTO[]) => {
                           this.tags = _value; 
                            //this.isLoading = false;
                           
                        },
                        error: () => {
                           // this.isLoading = false;
                        }
                    }
           
        );

    }
}


