import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';

import { FormComponent } from './form/form.component';
import { ArchivoComponent } from './form/controls/archivo/archivo.component';
import { DetalleComponent } from './form/controls/detalle/detalle.component';
import { ProcesoComponent } from './form/controls/proceso/proceso.component';
import { ProductoListaComponent } from './form/controls/producto-lista/producto-lista.component';
import { TextoComponent } from './form/controls/texto/texto.component';
import { BinarioComponent } from './form/controls/binario/binario.component';
import { ConfiguracionComponent } from './form/controls/configuracion/configuracion.component';
import { CroquisComponent } from './form/controls/croquis/croquis.component';
import { DisponibilidadComponent } from './form/controls/disponibilidad/disponibilidad.component';
import { FechaComponent } from './form/controls/fecha/fecha.component';
import { NumeroComponent } from './form/controls/numero/numero.component';
import { SeccionComponent } from './form/controls/seccion/seccion.component';
import { BaseComponent } from './form/controls/base/base.component';
import { GpsComponent } from './form/controls/gps/gps.component';
import { neuronRoutes } from './neuron.routing';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxCurrencyModule } from 'ngx-currency';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
    declarations: [
        TextoComponent,
        ArchivoComponent,
        BinarioComponent,
        ConfiguracionComponent,
        CroquisComponent,
        DetalleComponent,
        DisponibilidadComponent,
        FechaComponent,
        NumeroComponent,
        ProcesoComponent,
        ProductoListaComponent,
        SeccionComponent,
        BaseComponent,
        GpsComponent,
        FormComponent
    ],
    imports: [
        RouterModule.forChild(neuronRoutes),
        DragDropModule,
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        FuseCardModule,
        SharedModule,
        SharedMaterialModule,
        FlexLayoutModule,
        NgxMatTimepickerModule,
        NgxMatDatetimePickerModule,
        NgxCurrencyModule,
        SignaturePadModule,
        ZXingScannerModule,

    ]
})
export class NeuronModule {
}
