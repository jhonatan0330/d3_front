import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProductComponent } from './form/controls/product/product.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InformativeComponent } from './form/controls/informative/informative.component';
import { CurrencyMaskModule } from 'ng2-currency-mask';


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
        FormComponent,
        ProductComponent,
        InformativeComponent
    ],
    imports: [
        RouterModule.forChild(neuronRoutes),
        DragDropModule,
        AngularSignaturePadModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        CurrencyMaskModule,
        SharedModule,
        ZXingScannerModule,

        MatDatepickerModule,
        MatNativeDateModule,
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-ZA' },
    ]
})
export class NeuronModule {
}
