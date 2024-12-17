import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-indi-cards',
  templateUrl: './indi-cards.component.html'
})
export class IndiCardsComponent implements OnInit, OnDestroy {

  menuOpenCard: any = null;
  cards = [
    {
      title: '📊 Guías Procesadas Mensuales',
      value: '875',
      subtitle: 'Total de guías procesadas este mes.',
      detail: { label: 'Facturadas', value: 650 }
    },
    {
      title: '📊 Tasa de Entregas a Tiempo',
      value: '92%',
      subtitle: 'Porcentaje de entregas realizadas puntualmente.',
      detail: { label: 'Meta', value: '95%' }
    },
    {
      title: '📊 Desempeño de la Flota',
      value: '87%',
      subtitle: 'Eficiencia general de vehículos y rutas.',
      detail: { label: 'Vehículos en operación', value: 52 }
    },
    {
      title: '📊 Costo de Combustible',
      value: '$3,450',
      subtitle: 'Gasto total en combustible este mes.',
      detail: { label: 'Promedio por guía', value: '$3.94' }
    },
    {
      title: '📊 Órdenes Retrasadas',
      value: '28',
      subtitle: 'Cantidad de entregas con retrasos.',
      detail: { label: 'Retrasos críticos', value: 5 }
    },
    {
      title: '📊 Satisfacción del Cliente',
      value: '89%',
      subtitle: 'Clientes satisfechos en la última encuesta.',
      detail: { label: 'Respuestas obtenidas', value: 1_235 }
    }
  ];


  constructor() {

  }

  ngOnInit(): void { }
  ngOnDestroy(): void { }

  openMenu(card: any): void {
    this.menuOpenCard = this.menuOpenCard === card ? null : card;
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const clickedInsideMenu = targetElement.closest('.menu-open');
    const clickedOnButton = targetElement.closest('.menu-button');
    if (!clickedInsideMenu && !clickedOnButton) {
      this.menuOpenCard = null;
    }
  }

}

