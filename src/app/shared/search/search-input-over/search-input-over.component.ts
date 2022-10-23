import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PedidoVentaDTO } from 'app/model/sw42.domain';
import { PedidoVentaFilterDTO } from 'app/model/sw42.filter';
import { ApiService } from 'app/service/api.service';
import { TemplateService } from 'app/service/template.service';
import { UtilsService } from 'app/service/utils.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-search-input-over',
  templateUrl: './search-input-over.component.html',
  styleUrls: ['./search-input-over.component.scss'],
})
export class SearchInputOverComponent implements OnInit {
  isOpen = false;
  isLoading = false;
  disponibles: PedidoVentaDTO[]; // Contiene los documetnos que resultaron de consultar el servidor

  searchCtrl = new FormControl();

  constructor(
    private api: ApiService,
    private templateService: TemplateService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.searchCtrl.valueChanges.subscribe((value) => {
      // Algunas ocaciones recibo string aqui valido que se coloque un objeto como proceso
      if (value && value.llaveTabla) {
        this.openDocument(value);
        this.disponibles = [];
        this.searchCtrl.setValue('');
      }
    });
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  autoCompleteDisplay(item: PedidoVentaDTO): string {
    if (!item) {
      return;
    }
    if (item.descripcion) {
      return item.descripcion;
    } else {
      return item.nombre;
    }
  }

  search() {
    const texto = this.searchCtrl.value;
    if (texto && texto.llaveTabla) {
      this.searchCtrl.setValue('');
      return;
    }
    if (!texto || texto.length === 0) {
      // pasar esto a util para usar menos codigo
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Coloque el codigo exacto del documento',
      });
      // alert('Coloque el codigo exacto del documento');
      return;
    }
    const entitySearch: PedidoVentaFilterDTO = new PedidoVentaFilterDTO();
    entitySearch.nombre = texto;
    this.isLoading = true;
    this.api.listarDocumentos(entitySearch, null).subscribe({
      next: (_value: PedidoVentaDTO[]) => {
        this.isLoading = false;
        this.disponibles = [];
        if (!_value || _value.length === 0) {
          alert('No se encontraron resultados para ' + this.searchCtrl.value);
          this.searchCtrl.setValue('');
          return;
        }
        if (_value.length === 1) {
          this.openDocument(_value[0]);
          this.searchCtrl.setValue('');
        } else {
          this.disponibles = _value;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
      },
    });
  }

  openDocument(_doc: PedidoVentaDTO) {
    if (this.templateService.getTemplate(_doc.plantilla, null)) {
      this.utilsService.modalWithParams(
        _doc,
        false
      );
    } else {
      alert('No tienes permisos para ver este documento.');
    }
  }
}
