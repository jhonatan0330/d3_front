import { Component, OnInit, AfterViewInit, Input, ElementRef, Inject } from '@angular/core';
import { Map } from 'ol';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM, Vector } from 'ol/source';
import * as Proj from 'ol/proj';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { PedidoVentaDTO } from 'app/modules/full/neuron/model/sw42.domain';
import { DocumentoPlantillaCaracteristicaEnum } from 'app/modules/full/neuron/model/sw42.enum';
import { LineString } from 'ol/geom';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';


export const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAyVBMVEUAAADnTDznTDvnTDvnTDvAOCrnTDznSzvnTDvAOCvnTDznTDznTDvnTDzAOCrnTDvnTDvnTDvnTDznTDvAOSrnTDznTDzTQjLSQjPnTDzpTDvnSzvAOCrnTDvAOSvAOCvnSzvnTDzAOCvnSzznTDznTDvnTDy/OCvnTDznTDvnTDznSzvmSzvAOCvnTDzAOCvnTDvmTDvAOCq+OCrpTDzkSzrbRjbWRDTMPi+8NinrTT3EOy3gSDjTQjPPQDLHPS/DOiu5NCjHPC5jSfbDAAAAMHRSTlMAKPgE4hr8CfPy4NzUt7SxlnpaVlRPIhYPLgLt6ebOysXAwLmej4iGgGtpYkpAPCBw95QiAAAB50lEQVQ4y42T13aDMAxAbVb2TrO6927lwQhktf//UZWVQ1sIJLnwwBEXWZYwy1Lh/buG5TXu+rzC9nByDQCCbrg+KdUmLUsgW08IqzUp9rgDf5Ds8CJv1KS3mNL3fbGlOdr1Kh1AtFgs15vke7kQGpDO7pYGtJgfbRSxiXxaf7AjgsFfy1/WPu0r73WpwGiu1Fn78bF9JpWKUBTQzYlNQIK5lDcuQ9wbKeeBiTWz3vgUv44TpS4njJhcKpXEuMzpOCN+VE2FmPA9jbxjSrOf6kdG7FvYmkBJ6aYRV0oVYIusfkZ8xeHpUMna+LeYmlShxkG+Zv8GyohLf6aRzzRj9t+YVgWaX1IO08hQyi9tapxmB3huxJUp8q/EVYzB89wQr0y/FwqrHLqoDWsoLsxQr1iWNxp1iCnlRbt9IdELwfDGcrSMKJbGxLx4LenTFsszFSYehwl6aCZhTNPnO6LdBYOGYBVFqwAfDF27+CQIvLUGrTU9lpyFBw9yeA+sCNsRkJ5WQjg2K+QFcrywEjoCBHVpe3VYGZyk9NQCLxXte/jHvc1K4XXKSNQ520PPtIhcr8f2MXPShNiavTyn4jM7wK0g75YdYgTE6KA465nN9GbsILwhoMHZETx53hM7Brtet9lRDAYFwR80rG+sfAnbpQAAAABJRU5ErkJggg==';

@Component({
  selector: 'app-full-map',
  templateUrl: './full-map.component.html'
})
export class FullMapComponent implements OnInit, AfterViewInit {

  @Input() lat: number;
  @Input() lon: number;

  target: string = 'map-' + Math.random().toString(36).substring(2);
  nombre: String;
  documents: PedidoVentaDTO[];

  map: Map;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FullMapComponent>) { }

  ngOnInit(): void {
    this.lat = this.data.latitude;
    this.lon = this.data.longitud;
    this.nombre = this.data.nombre;
    this.documents = this.data.documents;
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
    this.addPoint();
  }

  addPoint() {
    const points = [[this.lon, this.lat]];

    const marker = new Feature({
      geometry: new Point(Proj.fromLonLat([this.lon, this.lat]))
    });
    const iconStyle: Style = new Style({
      image: new Icon({
        anchor: [1, 1],
        displacement: [22, 0],
        src: DEFAULT_ICON,
      })
    });
    marker.setStyle(iconStyle);

    const featurePoint = [marker];

    if (this.documents) {
      for (let i = 0; i < this.documents.length; i++) {
        const element = this.documents[i];
        if (element.caracteristicas) {
          for (let j = 0; j < element.caracteristicas.length; j++) {
            const field = element.caracteristicas[j];
            if (field.valorText && field.campoDTO && field.campoDTO.formato === DocumentoPlantillaCaracteristicaEnum.GPS) {
              const coma = field.valorText.indexOf(",");
              if (coma > 0) {
                const iLat = parseFloat(field.valorText.substring(0, coma));
                const iLng = parseFloat(field.valorText.substring(coma + 1, field.valorText.length));
                const pointMark = new Point(Proj.fromLonLat([iLng, iLat]));
                const iMarker = new Feature({
                  geometry: pointMark
                });
                points.push([iLng, iLat]);
                const iconStyle: Style = new Style({
                  image: new Icon({
                    anchor: [1, 1],
                    displacement: [22, 0],
                    src: DEFAULT_ICON,
                  })
                });
                iMarker.setStyle(iconStyle);
                featurePoint.push(iMarker);
              }
            }
          }
        }

      }
    }


    const vectorSource = new VectorSource({
      features: featurePoint
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    vectorLayer.setZIndex(10);

    for (let i = 0; i < points.length; i++) {
      points[i] = Proj.transform(points[i], 'EPSG:4326', 'EPSG:3857');
    }

    const featureLine = new Feature({
      geometry: new LineString(points)
    });

    const vectorLine = new Vector({});
    vectorLine.addFeature(featureLine);

    const vectorLineLayer = new VectorLayer({
      source: vectorLine,
      style: new Style({
        fill: new Fill({ color: '#00FF00' }),
        stroke: new Stroke({ color: '#00FF00', width: 4 })
      })
    });

    this.map.addLayer(vectorLineLayer);
    this.map.addLayer(vectorLayer);
  }


  closeMap() {
    this.dialogRef.close({ lon: this.lon, lat: this.lat });
  }

}