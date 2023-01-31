import { ChangeDetectorRef, Component, OnInit, AfterViewInit, Input, ElementRef } from '@angular/core';
import { Map } from 'ol';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import * as Proj from 'ol/proj';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { GPSLocalizacionDTO } from '../gps.domain';
import { GPSService } from '../gps.service';
import { Observable, Subject, takeUntil } from 'rxjs';


export const DEFAULT_HEIGHT = '500px';
export const DEFAULT_WIDTH = '500px';
export const DEFAULT_LAT = 4.6187533;
export const DEFAULT_LON = -74.1592163;

export const DEFAULT_ANCHOR = [1, 1];
export const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAyVBMVEUAAADnTDznTDvnTDvnTDvAOCrnTDznSzvnTDvAOCvnTDznTDznTDvnTDzAOCrnTDvnTDvnTDvnTDznTDvAOSrnTDznTDzTQjLSQjPnTDzpTDvnSzvAOCrnTDvAOSvAOCvnSzvnTDzAOCvnSzznTDznTDvnTDy/OCvnTDznTDvnTDznSzvmSzvAOCvnTDzAOCvnTDvmTDvAOCq+OCrpTDzkSzrbRjbWRDTMPi+8NinrTT3EOy3gSDjTQjPPQDLHPS/DOiu5NCjHPC5jSfbDAAAAMHRSTlMAKPgE4hr8CfPy4NzUt7SxlnpaVlRPIhYPLgLt6ebOysXAwLmej4iGgGtpYkpAPCBw95QiAAAB50lEQVQ4y42T13aDMAxAbVb2TrO6927lwQhktf//UZWVQ1sIJLnwwBEXWZYwy1Lh/buG5TXu+rzC9nByDQCCbrg+KdUmLUsgW08IqzUp9rgDf5Ds8CJv1KS3mNL3fbGlOdr1Kh1AtFgs15vke7kQGpDO7pYGtJgfbRSxiXxaf7AjgsFfy1/WPu0r73WpwGiu1Fn78bF9JpWKUBTQzYlNQIK5lDcuQ9wbKeeBiTWz3vgUv44TpS4njJhcKpXEuMzpOCN+VE2FmPA9jbxjSrOf6kdG7FvYmkBJ6aYRV0oVYIusfkZ8xeHpUMna+LeYmlShxkG+Zv8GyohLf6aRzzRj9t+YVgWaX1IO08hQyi9tapxmB3huxJUp8q/EVYzB89wQr0y/FwqrHLqoDWsoLsxQr1iWNxp1iCnlRbt9IdELwfDGcrSMKJbGxLx4LenTFsszFSYehwl6aCZhTNPnO6LdBYOGYBVFqwAfDF27+CQIvLUGrTU9lpyFBw9yeA+sCNsRkJ5WQjg2K+QFcrywEjoCBHVpe3VYGZyk9NQCLxXte/jHvc1K4XXKSNQ520PPtIhcr8f2MXPShNiavTyn4jM7wK0g75YdYgTE6KA465nN9GbsILwhoMHZETx53hM7Brtet9lRDAYFwR80rG+sfAnbpQAAAABJRU5ErkJggg==';
export const DEFAULT_TEXT = '';

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
  vectorLayer;
  pointsVectorLayer;

  private mapEl: HTMLElement;

  viewMap = new View({
    center: Proj.fromLonLat([DEFAULT_LON, DEFAULT_LAT]),
    zoom: 15
  });

  @Input() anchor: number[] = DEFAULT_ANCHOR;
  @Input() icon: string = DEFAULT_ICON;
  @Input() text: string = DEFAULT_TEXT;

  locations: GPSLocalizacionDTO[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private _gpsService: GPSService) { }

  ngOnInit(): void {
    // Get the locations
    this._gpsService.locations$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations: GPSLocalizacionDTO[]) => {
        this.locations = locations;
        if (this.vectorLayer) { this.map.removeLayer(this.vectorLayer); }
        this.addPoint(locations);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit(): void {
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
    this.mapEl = this.elementRef.nativeElement.querySelector('#' + this.target);
    if (this.mapEl) {
      const styles = this.mapEl.style;
      styles.height = coerceCssPixelValue(this.height) || DEFAULT_HEIGHT;
      styles.width = coerceCssPixelValue(this.width) || DEFAULT_WIDTH;
    }
  }

  addPoint(locations: GPSLocalizacionDTO[]) {
    if (this.pointsVectorLayer) { this.map.removeLayer(this.pointsVectorLayer); }
    if (!this.map) return;
    const markers: Feature<Point>[] = [];

    let latitud = 0;
    let longitud = 0;
    let lastPoint: GPSLocalizacionDTO;

    if (!locations || !locations.length) { return; }
    for (let i = 0; i < locations.length; i++) {
      const element = locations[i];
      latitud = element.latitud;
      longitud = element.longitud;
      if (latitud !== 0 && longitud !== 0) {
        markers.push(new Feature({
          geometry: new Point(Proj.fromLonLat([longitud, latitud]))
        }));
        lastPoint = element;
      }
    }

    const vectorSource = new VectorSource({
      features: markers
    });

    this.pointsVectorLayer = new VectorLayer({
      source: vectorSource
    });

    this.pointsVectorLayer.setZIndex(9);


    this.map.addLayer(this.pointsVectorLayer);
    if (lastPoint) {
      this.addMarker(lastPoint.latitud, lastPoint.longitud);
    }

  }

  center(lat: number, lng: number) {
    this.map.getView().animate({ zoom: 15, center: Proj.fromLonLat([lng, lat]) })
  }


  addMarker(lat: number, lng: number) {
    if (this.vectorLayer) { this.map.removeLayer(this.vectorLayer); }
    const marker = new Feature({
      geometry: new Point(Proj.fromLonLat([lng, lat]))
    });
    /*const markerText = new Feature({
      geometry: new Point(Proj.fromLonLat([lng, lat]))
    });*/

    const icon = new Style({
      image: new Icon({
        anchor: this.anchor,
        src: this.icon,
      })
    });

    /*const text = new Style({
      text: new Text({
        text: this.text,
        font: 'bold 12px arial',
        offsetY: 8,
        fill: new Fill({ color: 'rgb(0,0,0)' }),
        stroke: new Stroke({ color: 'rgb(255,255,255)', width: 1 })
      })
    });*/

    marker.setStyle(icon);
    //markerText.setStyle(text);

    const vectorSource = new VectorSource({
      features: [marker] //markerText
    });

    this.vectorLayer = new VectorLayer({
      source: vectorSource
    });

    this.vectorLayer.setZIndex(10);
    this.map.addLayer(this.vectorLayer);

    this.center(lat, lng);
  }

}

const cssUnitsPattern = /([A-Za-z%]+)$/;

function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}