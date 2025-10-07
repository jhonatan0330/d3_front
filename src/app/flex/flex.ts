import { CommonModule } from '@angular/common';
import {
    Component,
    OnInit,
} from '@angular/core';

interface Item {
    code: string;
    title: string;
    subtitle: string;
}

@Component({
    selector: 'FlexComponent',

    standalone: true,
    templateUrl: 'flex.html',
    imports: [CommonModule]
})
export class FlexComponent implements OnInit {


    isDarkMode = false;


    campos: Item[] = Array.from({ length: 12 }, (_, i) => ({
        code: `#C${(i + 1).toString().padStart(3, '0')}`,
        title: `Campo ${i + 1}`,
        subtitle: 'Descripción breve del campo',
    }));

    propiedadesCampo: Item[] = Array.from({ length: 10 }, (_, i) => ({
        code: `#PC${(i + 1).toString().padStart(3, '0')}`,
        title: `Propiedad ${i + 1}`,
        subtitle: 'Detalle de propiedad',
    }));

    propiedadesPlantilla: Item[] = Array.from({ length: 8 }, (_, i) => ({
        code: `#PP${(i + 1).toString().padStart(3, '0')}`,
        title: `Ajuste ${i + 1}`,
        subtitle: 'Información de la plantilla',
    }));

    reportes: Item[] = Array.from({ length: 12 }, (_, i) => ({
        code: `#R${(i + 1).toString().padStart(3, '0')}`,
        title: `Reporte ${i + 1}`,
        subtitle: 'Descripción del reporte',
    }));

    transiciones: Item[] = Array.from({ length: 12 }, (_, i) => ({
        code: `#T${(i + 1).toString().padStart(3, '0')}`,
        title: `Transición ${i + 1}`,
        subtitle: 'Descripción de transición',
    }));

    relaciones: Item[] = Array.from({ length: 12 }, (_, i) => ({
        code: `#RL${(i + 1).toString().padStart(3, '0')}`,
        title: `Relación ${i + 1}`,
        subtitle: 'Descripción de relación',
    }));

    ngOnInit(): void {
        // 🌙 Recupera modo oscuro de localStorage
        const saved = localStorage.getItem('isDarkMode');
        this.isDarkMode = saved === '1';
        if (this.isDarkMode) document.documentElement.classList.add('dark');

        // ✅ Datos de ejemplo
        this.campos = [
            { code: '#C001', title: 'Nombre', subtitle: 'Texto corto' },
            { code: '#C002', title: 'Apellido', subtitle: 'Texto corto' },
            { code: '#C003', title: 'Correo', subtitle: 'Debe ser un email válido' },
            { code: '#C004', title: 'Edad', subtitle: 'Número entero' },
            { code: '#C005', title: 'Ciudad', subtitle: 'Lista desplegable' },
        ];

        this.propiedadesCampo = [
            { code: '#PC001', title: 'Obligatorio', subtitle: 'Campo debe completarse' },
            { code: '#PC002', title: 'Longitud Máxima', subtitle: '255 caracteres' },
            { code: '#PC003', title: 'Valor por defecto', subtitle: 'N/A' },
        ];

        this.propiedadesPlantilla = [
            { code: '#PP001', title: 'Color', subtitle: 'Tema Azul' },
            { code: '#PP002', title: 'Diseño', subtitle: 'Layout en 3 columnas' },
            { code: '#PP003', title: 'Visibilidad', subtitle: 'Solo administradores' },
        ];

        this.reportes = Array.from({ length: 2 }, (_, i) => ({
            code: `#R${(i + 1).toString().padStart(3, '0')}`,
            title: `Reporte ${i + 1}`,
            subtitle: `Datos del reporte ${i + 1}`,
        }));

        this.transiciones = [
            { code: '#T001', title: 'Aprobación', subtitle: 'Cuando el estado pasa a aprobado' },
            { code: '#T002', title: 'Rechazo', subtitle: 'Cuando el estado pasa a rechazado' },
            { code: '#T003', title: 'Revisión', subtitle: 'Pendiente de validación' },
        ];

        this.relaciones = [
            { code: '#RL001', title: 'Cliente', subtitle: 'Relacionado con módulo clientes' },
            { code: '#RL002', title: 'Producto', subtitle: 'Relacionado con catálogo de productos' },
            { code: '#RL003', title: 'Pedido', subtitle: 'Referencia cruzada con pedidos' },
        ];
    }

    toggleDarkMode(): void {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark', this.isDarkMode);
        localStorage.setItem('isDarkMode', this.isDarkMode ? '1' : '0');
    }
}
