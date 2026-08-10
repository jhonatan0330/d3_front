import { Component, OnInit, AfterViewInit, ElementRef, ChangeDetectionStrategy, inject, Input, input } from '@angular/core';
import { Map } from 'ol';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import * as Proj from 'ol/proj';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';


export const DEFAULT_ANCHOR = [1, 1];
export const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAyVBMVEUAAADnTDznTDvnTDvnTDvAOCrnTDznSzvnTDvAOCvnTDznTDznTDvnTDzAOCrnTDvnTDvnTDvnTDznTDvAOSrnTDznTDzTQjLSQjPnTDzpTDvnSzvAOCrnTDvAOSvAOCvnSzvnTDzAOCvnSzznTDznTDvnTDy/OCvnTDznTDvnTDznSzvmSzvAOCvnTDzAOCvnTDvmTDvAOCq+OCrpTDzkSzrbRjbWRDTMPi+8NinrTT3EOy3gSDjTQjPPQDLHPS/DOiu5NCjHPC5jSfbDAAAAMHRSTlMAKPgE4hr8CfPy4NzUt7SxlnpaVlRPIhYPLgLt6ebOysXAwLmej4iGgGtpYkpAPCBw95QiAAAB50lEQVQ4y42T13aDMAxAbVb2TrO6927lwQhktf//UZWVQ1sIJLnwwBEXWZYwy1Lh/buG5TXu+rzC9nByDQCCbrg+KdUmLUsgW08IqzUp9rgDf5Ds8CJv1KS3mNL3fbGlOdr1Kh1AtFgs15vke7kQGpDO7pYGtJgfbRSxiXxaf7AjgsFfy1/WPu0r73WpwGiu1Fn78bF9JpWKUBTQzYlNQIK5lDcuQ9wbKeeBiTWz3vgUv44TpS4njJhcKpXEuMzpOCN+VE2FmPA9jbxjSrOf6kdG7FvYmkBJ6aYRV0oVYIusfkZ8xeHpUMna+LeYmlShxkG+Zv8GyohLf6aRzzRj9t+YVgWaX1IO08hQyi9tapxmB3huxJUp8q/EVYzB89wQr0y/FwqrHLqoDWsoLsxQr1iWNxp1iCnlRbt9IdELwfDGcrSMKJbGxLx4LenTFsszFSYehwl6aCZhTNPnO6LdBYOGYBVFqwAfDF27+CQIvLUGrTU9lpyFBw9yeA+sCNsRkJ5WQjg2K+QFcrywEjoCBHVpe3VYGZyk9NQCLxXte/jHvc1K4XXKSNQ520PPtIhcr8f2MXPShNiavTyn4jM7wK0g75YdYgTE6KA465nN9GbsILwhoMHZETx53hM7Brtet9lRDAYFwR80rG+sfAnbpQAAAABJRU5ErkJggg==';
export const DEFAULT_TEXT = '';

@Component({
    selector: 'app-ol-map',
    templateUrl: './ol-map.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatIconButton, MatPrefix, MatIcon, MatInput, FormsModule, ReactiveFormsModule, MatSuffix]
})
export class OlMapComponent implements OnInit, AfterViewInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<OlMapComponent>>(MatDialogRef);
  private elementRef = inject(ElementRef);


  @Input() lat: number;
  @Input() lon: number;
  readonly zoom = input<number | undefined>(undefined);
  readonly anchor = input<number[]>(DEFAULT_ANCHOR);
  readonly icon = input<string>(DEFAULT_ICON);
  readonly text = input<string>(DEFAULT_TEXT);

  target: string = 'map-' + Math.random().toString(36).substring(2);
  nombre: String;
  fControl = new FormControl('');

  map: Map;
  vectorLayer: VectorLayer;
  marker: Feature;

  ngOnInit(): void {
    this.lat = this.data.latitude;
    this.lon = this.data.longitud;
    this.nombre = this.data.nombre;
    this.fControl.setValue(this.lat + "," + this.lon);
  }

  ngAfterViewInit(): void {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: this.target,
      view: new View({
          center: Proj.fromLonLat([this.lon, this.lat]),
        zoom: 15
      }),
    });
      this.addPoint(this.lat, this.lon);
    //this.map.on('click', handlerClick);
    //this.map.addEventListener('click', this.handlerClick2);
  }


  addPoint(lat: number, lng: number) {
    this.marker = new Feature({
      geometry: new Point(Proj.fromLonLat([this.lon, this.lat]))
    });

    const iconStyle: Style = new Style({
      image: new Icon({
        anchor: this.anchor(),
        displacement: [22, 0],
        src: this.icon(),
      })
    });

    this.marker.setStyle(iconStyle);

    const vectorSource = new VectorSource({
      features: [this.marker]
    });

    this.vectorLayer = new VectorLayer({
      source: vectorSource
    });

    this.vectorLayer.setZIndex(10);
    this.map.addLayer(this.vectorLayer);
  }

  handlerClick(evt) {
    this.marker.setGeometry(new Point(this.map.getEventCoordinate(evt)));
    let coord = Proj.toLonLat(this.map.getEventCoordinate(evt));
    this.lat = coord[1];
    this.lon = coord[0];
    this.fControl.setValue(this.lat + "," + this.lon);
  }

  closeMap() {
    this.dialogRef.close({ lon: this.lon, lat: this.lat });
  }

}
