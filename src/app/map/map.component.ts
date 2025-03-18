import { Component, OnInit, AfterViewInit, ViewChild, NgZone } from '@angular/core';
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
import { ManualTracksService } from '../services/manual-tracks.service';
import { ManualTrack } from '../services/manual-tracks.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, PopupComponent, ContextMenuComponent, TrackPanelComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit {
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
  manualTracks: ManualTrack[] = [];
  elementDetailsVisible: boolean = false;
  selectedElement: { name: string, waypoints: { lat: number, lon: number }[] } | null = null;
  
  // Store the clicked coordinates for track creation
  private clickedCoordinates: number[] = [];
  
  @ViewChild(PopupComponent) popupComponent!: PopupComponent;
  @ViewChild(ContextMenuComponent) contextMenuComponent!: ContextMenuComponent;
  @ViewChild(TrackPanelComponent) trackPanelComponent!: TrackPanelComponent;

  constructor(private manualTracksService: ManualTracksService, private ngZone: NgZone) { }

  ngOnInit(): void {
    this.manualTracksService.getTracks().subscribe((tracks: ManualTrack[]) => {
      this.manualTracks = tracks;
      if (this.vectorSource) {
        this.updateManualTrackMarkers();
      }
    });
  }

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
    
    this.updateManualTrackMarkers();
    
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
        
        // Add click handler to show popup or element details when clicking on features
        this.map.on('click', (evt) => {
          this.ngZone.run(() => {
            console.log('Map click event:', evt);
            // Hide context menu on regular click
            this.contextMenuVisible = false;

            const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature, { hitTolerance: 15 });
            console.log('Clicked feature:', feature);

            if (feature) {
              if (feature === eiffelTowerFeature) {
                const geometry = feature.getGeometry();
                if (geometry && geometry instanceof Point) {
                  const coordinates = geometry.getCoordinates();
                  // Set popup content for Eiffel Tower
                  this.popupTitle = feature.get('name');
                  this.popupContent = feature.get('description');
                  this.popupLink = 'https://en.wikipedia.org/wiki/Eiffel_Tower';
                  this.popupVisible = true;
                  // Hide element details panel if open
                  this.elementDetailsVisible = false;
                  this.selectedElement = null;
                  // Position the popup
                  popupOverlay.setPosition(coordinates);
                }
              } else if (feature.get('manualElement')) {
                console.log('Manual element marker clicked');
                // Handle click on manual element marker
                this.popupVisible = false;
                popupOverlay.setPosition(undefined);
                const geometry = feature.getGeometry();
                if (geometry && geometry instanceof Point) {
                  const lonlat = toLonLat(geometry.getCoordinates());
                  const trackId = feature.get('trackId');
                  // Find the track with this ID
                  const track = this.manualTracks.find(t => t.id === trackId);
                  if (track) {
                    this.selectedElement = {
                      name: track.name,
                      waypoints: [...track.waypoints]
                    };
                    this.elementDetailsVisible = true;
                  }
                }
              } else {
                // For other features, hide both popups and panels
                this.popupVisible = false;
                this.elementDetailsVisible = false;
                this.selectedElement = null;
                popupOverlay.setPosition(undefined);
              }
            } else {
              // No feature clicked, hide all popups/panels
              this.popupVisible = false;
              this.elementDetailsVisible = false;
              this.selectedElement = null;
              popupOverlay.setPosition(undefined);
            }
          });
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
  

    this.saveManualTrack(trackData.name);
    
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
  
  /* Add new method to save a manual track using ManualTracksService */
  saveManualTrack(name: string): void {
    if (this.clickedCoordinates && this.clickedCoordinates.length >= 2) {
      const lonLat = toLonLat(this.clickedCoordinates);
      const trackCoordinate: TrackCoordinate = { lat: lonLat[1], lon: lonLat[0] };
      this.manualTracksService.addTrack({ 
        name, 
        waypoints: [trackCoordinate] // Initialize with a single waypoint
      });
      console.log('Manual element added:', name, trackCoordinate);
    }
  }
  
  private updateManualTrackMarkers(): void {
    if (!this.vectorSource) { return; }

    // Remove previous manual track markers
    this.vectorSource.getFeatures().forEach(feature => {
      if (feature.get('manualElement')) {
        this.vectorSource.removeFeature(feature);
      }
    });

    // Add a marker for each manual track with its name as a label
    this.manualTracks.forEach(track => {
      // Process each waypoint in the track
      track.waypoints.forEach((waypoint, index) => {
        const coordinates = fromLonLat([waypoint.lon, waypoint.lat]);
        const markerFeature = new Feature({
          geometry: new Point(coordinates),
          name: track.name,
          trackId: track.id,
          waypointIndex: index
        });

        // Style for the marker - use different colors for first vs other waypoints
        const markerColor = index === 0 ? 'rgba(0, 128, 255, 0.8)' : 'rgba(255, 128, 0, 0.8)';
        const markerText = index === 0 ? track.name : `${track.name} (pt ${index + 1})`;
        
        markerFeature.setStyle(new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: markerColor }),
            stroke: new Stroke({ color: '#fff', width: 2 })
          }),
          text: new Text({
            text: markerText,
            font: 'bold 12px Arial',
            fill: new Fill({ color: '#333' }),
            stroke: new Stroke({ color: '#fff', width: 3 }),
            offsetY: -20
          })
        }));

        markerFeature.set('manualElement', true);
        this.vectorSource.addFeature(markerFeature);
      });
    });
  }

  closeElementDetails(): void {
    this.elementDetailsVisible = false;
    this.selectedElement = null;
  }

  /**
   * Adds a waypoint to the specified element
   * @param elementId - The ID of the element to add a waypoint to
   */
  addWaypointToElement(elementId: number): void {
    // Get the track
    const track = this.manualTracksService.getTrackById(elementId);
    if (!track) {
      alert('Element not found!');
      return;
    }

    // Show a modal to let the user know what to do
      const clickListener = this.map.once('click', (evt) => {
        // Get the coordinates of the click
        const lonlat = toLonLat(evt.coordinate);
        
        // Create a copy of the track
        const updatedTrack = { ...track };
        
        // Add the new waypoint to the waypoints array
        updatedTrack.waypoints = [...track.waypoints, { lat: lonlat[1], lon: lonlat[0] }];
        
        // Update the track in the service
        this.manualTracksService.updateTrack(updatedTrack);
        
        // Update the markers
        this.updateManualTrackMarkers();
        
        // Notify the user
      });
  }
}
