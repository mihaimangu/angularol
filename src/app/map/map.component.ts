import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Fill, Stroke, Text, Circle } from 'ol/style';
import Overlay from 'ol/Overlay';
import Geometry from 'ol/geom/Geometry';
import { PopupComponent } from '../popup/popup.component';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { TrackPanelComponent, TrackCoordinate } from '../track-panel/track-panel.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, PopupComponent, ContextMenuComponent, TrackPanelComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {
  private map!: Map;
  private vectorSource!: VectorSource;
  private startingPositionFeature: Feature | null = null;
  
  // Eiffel Tower coordinates (longitude, latitude)
  private eiffelTowerCoords = [2.2945, 48.8584];
  
  // Popup data
  popupTitle: string = '';
  popupContent: string = '';
  popupLink: string = '';
  popupVisible: boolean = false;
  
  // Context menu data
  contextMenuX: number = 0;
  contextMenuY: number = 0;
  contextMenuVisible: boolean = false;
  
  // Track panel data
  trackPanelVisible: boolean = false;
  trackCoordinates: TrackCoordinate[] = [];
  
  // Store the clicked coordinates for track creation
  private clickedCoordinates: number[] = [];
  
  @ViewChild(PopupComponent) popupComponent!: PopupComponent;
  @ViewChild(ContextMenuComponent) contextMenuComponent!: ContextMenuComponent;
  @ViewChild(TrackPanelComponent) trackPanelComponent!: TrackPanelComponent;

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

    // Vector source and layer for the markers
    this.vectorSource = new VectorSource({
      features: [eiffelTowerFeature]
    });

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
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
          // Hide context menu on regular click
          this.contextMenuVisible = false;
          
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
        
        // Add context menu on right-click
        this.map.getViewport().addEventListener('contextmenu', (evt) => {
          evt.preventDefault();
          
          // Get the clicked coordinates
          const pixel = this.map.getEventPixel(evt);
          const coordinate = this.map.getCoordinateFromPixel(pixel);
          this.clickedCoordinates = coordinate;
          
          // Show context menu at click position
          this.contextMenuX = evt.clientX;
          this.contextMenuY = evt.clientY;
          this.contextMenuVisible = true;
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
  
  /**
   * Handle popup close event
   */
  onPopupClose(): void {
    this.popupVisible = false;
  }
  
  /**
   * Handle context menu close event
   */
  onContextMenuClose(): void {
    this.contextMenuVisible = false;
  }
  
  /**
   * Handle create track event from context menu
   */
  onCreateTrack(): void {
    // Convert clicked coordinates to lon/lat
    if (this.clickedCoordinates.length > 0) {
      const lonLat = toLonLat(this.clickedCoordinates);
      
      // Clear previous coordinates and add the new one
      this.trackCoordinates = [{
        lon: lonLat[0],
        lat: lonLat[1]
      }];
      
      // Add a marker at the starting position
      this.addStartingPositionMarker(this.clickedCoordinates);
      
      // Show track panel
      this.trackPanelVisible = true;
    }
  }
  
  /**
   * Add a marker at the starting position
   */
  private addStartingPositionMarker(coordinates: number[]): void {
    // Remove previous starting position marker if it exists
    if (this.startingPositionFeature) {
      this.vectorSource.removeFeature(this.startingPositionFeature);
    }
    
    // Create a new feature for the starting position
    this.startingPositionFeature = new Feature({
      geometry: new Point(coordinates),
      name: 'Starting Position'
    });
    
    // Style for the starting position marker
    this.startingPositionFeature.setStyle(
      new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: 'rgba(0, 128, 255, 0.7)' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new Text({
          text: 'Starting Position',
          font: 'bold 12px Arial',
          fill: new Fill({ color: '#333' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          offsetY: -20
        })
      })
    );
    
    // Add the feature to the map
    this.vectorSource.addFeature(this.startingPositionFeature);
  }
  
  /**
   * Handle track panel close event
   */
  onTrackPanelClose(): void {
    this.trackPanelVisible = false;
    
    // Remove the starting position marker when closing without saving
    if (this.startingPositionFeature) {
      this.vectorSource.removeFeature(this.startingPositionFeature);
      this.startingPositionFeature = null;
    }
  }
  
  /**
   * Handle save track event
   */
  onSaveTrack(trackData: {name: string, startingPosition: TrackCoordinate}): void {
    console.log('Track saved:', trackData);
    // Here you would typically save the track to a database or local storage
    
    // For demonstration, we'll just log it
    alert(`Track "${trackData.name}" saved with starting position at Lat: ${trackData.startingPosition.lat.toFixed(6)}, Lon: ${trackData.startingPosition.lon.toFixed(6)}`);
    
    // Keep the marker on the map after saving
    if (this.startingPositionFeature) {
      // Update the marker text to show the track name
      this.startingPositionFeature.setStyle(
        new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: 'rgba(0, 128, 255, 0.7)' }),
            stroke: new Stroke({ color: '#fff', width: 2 })
          }),
          text: new Text({
            text: trackData.name,
            font: 'bold 12px Arial',
            fill: new Fill({ color: '#333' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
            offsetY: -20
          })
        })
      );
    }
    
    // Clear the coordinates for the next track
    this.trackCoordinates = [];
  }
}
