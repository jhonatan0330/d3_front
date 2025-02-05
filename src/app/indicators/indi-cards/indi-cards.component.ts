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
      detail: { label: 'Facturadas', value: 650 },
      type: 'quantity',
      color: 'text-blue-500'
    },
    // {
    //   title: '📊 Órdenes Retrasadas', 
    //   value: '28',
    //   subtitle: 'Cantidad de entregas con retrasos.',
    //   detail: { label: 'Retrasos críticos', value: 5 },
    //   type: 'quantity',
    //   color: 'text-blue-500'
    // },
    {
      title: '📊 Tasa de Entregas a Tiempo',
      value: '92%',
      subtitle: 'Porcentaje de entregas realizadas puntualmente.',
      detail: { label: 'Meta', value: '95%' },
      type: 'percentage'
    },
    {
      title: '📊 Desempeño de la Flota',
      value: '37%',
      subtitle: 'Eficiencia general de vehículos y rutas.',
      detail: { label: 'Vehículos en operación', value: 52 },
      type: 'percentage'
    },
    {
      title: '📊 Costo de Combustible',
      value: '$3,450',
      subtitle: 'Gasto total en combustible este mes.',
      detail: { label: 'Promedio por guía', value: '$3.94' },
      type: 'price'
    },
    {
      title: '📊 Satisfacción del Cliente',
      value: '73%',
      subtitle: 'Clientes satisfechos en la última encuesta.',
      detail: { label: 'Respuestas obtenidas', value: '90%' },
      type: 'percentage'
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

  getValueColor(card: any): string {
    if (card.color) return card.color;

    const numericValue = parseFloat(card.value.replace('%', '').replace('$', '').replace(',', ''));

    if (isNaN(numericValue)) return 'text-blue-500';

    switch (card.type) {
      case 'percentage':
        if (numericValue > 71) return 'text-green-500';
        if (numericValue > 30 && numericValue < 70) return 'text-yellow-500';
        return 'text-red-500';
      case 'price':
        return numericValue < 1000 ? 'text-green-500' : 'text-red-500';
      case 'quantity':
        if (numericValue <= 10) return 'text-red-500';
        if (numericValue <= 50) return 'text-yellow-500';
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  }



}

