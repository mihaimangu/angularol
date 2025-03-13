import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Fill, Stroke, Text, Circle } from 'ol/style';
import Overlay from 'ol/Overlay';
import Geometry from 'ol/geom/Geometry';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, PopupComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private map!: Map;
  
  // Eiffel Tower coordinates (longitude, latitude)
  private eiffelTowerCoords = [2.2945, 48.8584];
  
  // Popup data
  popupTitle: string = '';
  popupContent: string = '';
  popupLink: string = '';
  popupVisible: boolean = false;
  
  @ViewChild(PopupComponent) popupComponent!: PopupComponent;

  constructor() { }

  ngAfterViewInit(): void {
    // Add a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap(): void {
    // Create a point feature for the Eiffel Tower
    const eiffelTowerFeature = new Feature({
      geometry: new Point(fromLonLat(this.eiffelTowerCoords)),
      name: 'Eiffel Tower',
      description: 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.'
    });

    // Style for the Eiffel Tower marker - using a more visible style
    eiffelTowerFeature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'assets/marker.png',
          scale: 1.0,
          // Add a slight offset to position the marker correctly
          displacement: [0, 0]
        }),
        text: new Text({
          text: 'Eiffel Tower',
          font: 'bold 14px Arial',
          fill: new Fill({ color: '#333' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          offsetY: -20
        })
      })
    );

    // Add a backup circle style in case the marker image doesn't load
    const backupStyle = new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.7)' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: 'Eiffel Tower',
        font: 'bold 14px Arial',
        fill: new Fill({ color: '#333' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
        offsetY: -20
      })
    });

    // Vector source and layer for the marker
    const vectorSource = new VectorSource({
      features: [eiffelTowerFeature]
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 10 // Ensure the marker is on top of other layers
    });

    // Create the map
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat(this.eiffelTowerCoords),
        zoom: 16 // Zoom in a bit more to see the Eiffel Tower better
      })
    });
    
    // Create popup overlay
    setTimeout(() => {
      if (this.popupComponent) {
        const popupOverlay = new Overlay({
          element: this.popupComponent.getElement(),
          positioning: 'bottom-center',
          stopEvent: false,
          offset: [0, -10]
        });
        
        this.map.addOverlay(popupOverlay);
        
        // Add click handler to show popup when clicking on the feature
        this.map.on('click', (evt) => {
          const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
          
          if (feature && feature === eiffelTowerFeature) {
            const geometry = feature.getGeometry();
            if (geometry && geometry instanceof Point) {
              const coordinates = geometry.getCoordinates();
              
              // Set popup content
              this.popupTitle = feature.get('name');
              this.popupContent = feature.get('description');
              this.popupLink = 'https://en.wikipedia.org/wiki/Eiffel_Tower';
              this.popupVisible = true;
              
              // Position the popup
              popupOverlay.setPosition(coordinates);
            }
          } else {
            this.popupVisible = false;
            popupOverlay.setPosition(undefined);
          }
        });
        
        // Change cursor style when hovering over the feature
        this.map.on('pointermove', (e) => {
          const pixel = this.map.getEventPixel(e.originalEvent);
          const hit = this.map.hasFeatureAtPixel(pixel);
          const target = this.map.getTarget() as HTMLElement;
          target.style.cursor = hit ? 'pointer' : '';
        });
      }
    }, 0);
    
    // Force a resize after map initialization
    setTimeout(() => {
      this.map.updateSize();
      
      // Check if the marker image loaded, if not use the backup style
      const img = new Image();
      img.onload = () => {
        console.log('Marker image loaded successfully');
      };
      img.onerror = () => {
        console.log('Marker image failed to load, using backup style');
        eiffelTowerFeature.setStyle(backupStyle);
      };
      img.src = 'assets/marker.png';
    }, 200);
  }
  
  onPopupClose(): void {
    this.popupVisible = false;
  }
}
