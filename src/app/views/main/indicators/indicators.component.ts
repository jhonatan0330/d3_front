import { Component, OnInit } from '@angular/core';
import { IndicadorDTO } from '../../../model/sw42.domain';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
})
export class IndicatorsComponent implements OnInit {
  indicadores: IndicadorDTO[] = [];
  /*[
    {
      llaveTabla: '1',
      estado: 'A',
      nombre: 'Hosting e Infraestructura',
      codigo: 'X',
      valorDia: 50,
      valorMes: 10,
      valorYear: 200,
    },
    {
      llaveTabla: '2',
      estado: 'A',
      nombre: 'Almacenamiento',
      codigo: 'X',
      valorDia: 50,
      valorMes: 10,
      valorYear: 200,
    },
    {
      llaveTabla: '3',
      estado: 'A',
      nombre: 'Desarrollo de Software',
      codigo: 'X',
      valorDia: 50,
      valorMes: 10,
      valorYear: 2000000000,
    },
    {
      llaveTabla: '4',
      estado: 'A',
      nombre: 'Indicador 4',
      codigo: 'X',
      valorDia: 50,
      valorMes: 1000,
      valorYear: 2000000000,
    }
  ];*/

  sharedChartOptions: any = {
    responsive: true,
    // maintainAspectRatio: false,
    legend: {
      display: false,
      position: 'bottom',
    },
  };
  chartColors: Array<any> = [
    {
      backgroundColor: '#3f51b5',
      borderColor: '#3f51b5',
      pointBackgroundColor: '#3f51b5',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
    },
    {
      backgroundColor: '#eeeeee',
      borderColor: '#e0e0e0',
      pointBackgroundColor: '#e0e0e0',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
    },
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
    },
  ];
  /*
   * Bar Chart
   */
  barChartLabels: string[] = ['1', '2', '3', '4', '5', '6', '7'];
  barChartType = 'bar';
  barChartLegend = true;
  barChartData: any[] = [
    {
      data: [5, 6, 7, 8, 4, 5, 5],
      label: 'Series A',
      borderWidth: 0,
    },
    {
      data: [5, 4, 4, 3, 6, 2, 5],
      label: 'Series B',
      borderWidth: 0,
    },
  ];
  barChartOptions: any = Object.assign(
    {
      scaleShowVerticalLines: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
            position: 'left',
            ticks: {
              beginAtZero: true,
              suggestedMax: 9,
            },
          },
        ],
      },
    },
    this.sharedChartOptions
  );

  // Horizontal Bar Chart
  barChartHorizontalType = 'horizontalBar';
  barChartHorizontalOptions: any = Object.assign(
    {
      scaleShowVerticalLines: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
            ticks: {
              beginAtZero: true,
              suggestedMax: 9,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
          },
        ],
      },
    },
    this.sharedChartOptions
  );

  // Bar Chart Stacked
  barChartStackedOptions: any = Object.assign(
    {
      scaleShowVerticalLines: false,
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
            stacked: true,
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
            stacked: true,
          },
        ],
      },
    },
    this.sharedChartOptions
  );

  /*
   * Line Chart Options
   */
  lineChartData: Array<any> = [
    {
      data: [5, 5, 7, 8, 4, 5, 5],
      label: 'Series A',
      borderWidth: 1,
    },
    {
      data: [5, 4, 4, 3, 6, 2, 5],
      label: 'Series B',
      borderWidth: 1,
    },
  ];
  lineChartLabels: Array<any> = ['1', '2', '3', '4', '5', '6', '7'];
  lineChartOptions: any = Object.assign(
    {
      animation: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
            ticks: {
              beginAtZero: true,
              suggestedMax: 9,
            },
          },
        ],
      },
    },
    this.sharedChartOptions
  );
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';
  lineChartPointsData: Array<any> = [
    {
      data: [6, 5, 8, 8, 5, 5, 4],
      label: 'Series A',
      borderWidth: 1,
      fill: false,
      pointRadius: 10,
      pointHoverRadius: 15,
      showLine: false,
    },
    {
      data: [5, 4, 4, 2, 6, 2, 5],
      label: 'Series B',
      borderWidth: 1,
      fill: false,
      pointRadius: 10,
      pointHoverRadius: 15,
      showLine: false,
    },
  ];
  lineChartPointsOptions: any = Object.assign(
    {
      scales: {
        xAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: 'rgba(0,0,0,0.02)',
              zeroLineColor: 'rgba(0,0,0,0.02)',
            },
            ticks: {
              beginAtZero: true,
              suggestedMax: 9,
            },
          },
        ],
      },
      elements: {
        point: {
          pointStyle: 'rectRot',
        },
      },
    },
    this.sharedChartOptions
  );

  constructor() {}

  ngOnInit(): void {}
}
