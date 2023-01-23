import { Component, OnInit, AfterViewInit, Input, ElementRef } from '@angular/core';
import { Map } from 'ol';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import * as Proj from 'ol/proj';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';


export const DEFAULT_HEIGHT = '500px';
export const DEFAULT_WIDTH = '500px';
export const DEFAULT_LAT = 4.6187533;
export const DEFAULT_LON = -74.1592163;


@Component({
  selector: 'gps-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit, AfterViewInit {

  @Input() zoom: number;
  @Input() width: string | number = DEFAULT_WIDTH;
  @Input() height: string | number = DEFAULT_HEIGHT;

  target: string = 'map-' + Math.random().toString(36).substring(2);

  map: Map;

  private mapEl: HTMLElement;

  viewMap = new View({
    center: Proj.fromLonLat([DEFAULT_LON, DEFAULT_LAT]),
    zoom: 15
  })

  constructor(
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.mapEl = this.elementRef.nativeElement.querySelector('#' + this.target);
    this.setSize();

    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: this.target,
      view: this.viewMap,
    });
  }

  private setSize() {
    if (this.mapEl) {
      const styles = this.mapEl.style;
      styles.height = coerceCssPixelValue(this.height) || DEFAULT_HEIGHT;
      styles.width = coerceCssPixelValue(this.width) || DEFAULT_WIDTH;
    }
  }

  addPoint(lat: number, lng: number) {
    const point =  new Point(Proj.fromLonLat([lng, lat]))
    const marker = new Feature({
      geometry: point
    });

    const vectorSource = new VectorSource({
      features: [marker]
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    vectorLayer.setZIndex(10);

    this.map.addLayer(vectorLayer);

  }

  center(lat: number, lng: number){
    this.map.getView().animate({zoom: 15, center: Proj.fromLonLat([lng, lat])})
  }


}

const cssUnitsPattern = /([A-Za-z%]+)$/;

function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}