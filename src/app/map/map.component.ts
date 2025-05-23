import { Component, OnInit, AfterViewInit, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import LineString from 'ol/geom/LineString';
import { PopupComponent } from '../popup/popup.component';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { TrackPanelComponent, TrackCoordinate } from '../track-panel/track-panel.component';
import { ManualTracksService } from '../services/manual-tracks.service';
import { ManualTrack } from '../services/manual-tracks.service';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { SearchPanelComponent } from '../search-panel.component';



@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PopupComponent, 
    ContextMenuComponent, 
    TrackPanelComponent,
    TimePickerComponent,
    SearchPanelComponent
  ],
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
  
  // Color palette array for track coloring
  private colorPalette: string[] = [
    'rgba(66, 133, 244, 0.8)',   // Blue
    'rgba(219, 68, 55, 0.8)',    // Red
    'rgba(244, 180, 0, 0.8)',    // Yellow
    'rgba(15, 157, 88, 0.8)',    // Green
    'rgba(171, 71, 188, 0.8)',   // Purple
    'rgba(255, 112, 67, 0.8)',   // Orange
    'rgba(0, 172, 193, 0.8)',    // Cyan
    'rgba(124, 179, 66, 0.8)',   // Light green
    'rgba(3, 169, 244, 0.8)',    // Light blue
    'rgba(229, 57, 53, 0.8)',    // Bright red
    'rgba(253, 216, 53, 0.8)',   // Bright yellow
    'rgba(76, 175, 80, 0.8)',    // Medium green
    'rgba(156, 39, 176, 0.8)',   // Medium purple
    'rgba(255, 87, 34, 0.8)',    // Deep orange
    'rgba(0, 188, 212, 0.8)',    // Teal
    'rgba(139, 195, 74, 0.8)',   // Lime
    'rgba(33, 150, 243, 0.8)',   // Light blue 2
    'rgba(244, 67, 54, 0.8)',    // Red 2
    'rgba(255, 235, 59, 0.8)',   // Yellow 2
    'rgba(0, 150, 136, 0.8)'     // Teal 2
  ];
  
  // Selected track ID for highlighting
  private selectedTrackId: number | null = null;
  
  // Time picker properties
  selectedTime: string = new Date().toTimeString().slice(0, 5);
  // Arabic UI flag
  useArabic: boolean = false;
  
  // External hour and minute pickers
  externalHour: string = '06';
  externalMinute: string = '00';
  
  // Search panel state
  showSearchPanel: boolean = false;
  selectedItem: { id: number, name: string } | null = null;
  
  @ViewChild(PopupComponent) popupComponent!: PopupComponent;
  @ViewChild(ContextMenuComponent) contextMenuComponent!: ContextMenuComponent;
  @ViewChild(TrackPanelComponent) trackPanelComponent!: TrackPanelComponent;
  @ViewChild(SearchPanelComponent) searchPanelComponent!: SearchPanelComponent;

  constructor(private manualTracksService: ManualTracksService, private ngZone: NgZone) { }

  ngOnInit(): void {
    this.manualTracksService.getTracks().subscribe((tracks: ManualTrack[]) => {
      this.manualTracks = tracks;
      if (this.vectorSource) {
        this.updateManualTrackMarkers();
      }
    });
    // Initialize external pickers from selectedTime
    this.setExternalPickersFromSelectedTime();
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
                    // Set this as the selected track
                    this.selectedTrackId = trackId;
                    this.selectedElement = {
                      name: track.name,
                      waypoints: [...track.waypoints]
                    };
                    this.elementDetailsVisible = true;
                    
                    // Update the markers to highlight the selected track
                    this.updateManualTrackMarkers();
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
      if (feature.get('manualElement') || feature.get('trackLine')) {
        this.vectorSource.removeFeature(feature);
      }
    });

    // Add a marker for each manual track with its name as a label
    this.manualTracks.forEach((track, trackIndex) => {
      // Get color for this track (cycle through palette if more than 20 tracks)
      const colorIndex = trackIndex % this.colorPalette.length;
      const trackColor = this.colorPalette[colorIndex];
      
      // Check if this track is selected
      const isSelected = track.id === this.selectedTrackId;
      
      // Create an array to hold all waypoint coordinates for this track
      const lineCoordinates: number[][] = [];
      
      // Process each waypoint in the track
      track.waypoints.forEach((waypoint, waypointIndex) => {
        const coordinates = fromLonLat([waypoint.lon, waypoint.lat]);
        // Add to line coordinates array
        lineCoordinates.push(coordinates);
        
        const markerFeature = new Feature({
          geometry: new Point(coordinates),
          name: track.name,
          trackId: track.id,
          waypointIndex: waypointIndex
        });

        // Same color for all waypoints in a track, but add waypoint number to label
        const markerText = waypointIndex === 0 ? 
                          track.name : 
                          `${track.name} (pt ${waypointIndex + 1})`;
        
        // Apply enhanced styling for selected track
        const radius = isSelected ? 12 : 8;  // Larger radius for selected track
        const fontSize = isSelected ? 'bold 14px Arial' : 'bold 12px Arial';  // Larger font for selected track
        
        markerFeature.setStyle(new Style({
          image: new Circle({
            radius: radius,
            fill: new Fill({ color: trackColor }),
            stroke: new Stroke({ 
              color: isSelected ? '#000' : '#fff',  // Black border for selected elements
              width: isSelected ? 3 : 2  // Thicker border for selected elements
            })
          }),
          text: new Text({
            text: markerText,
            font: fontSize,
            fill: new Fill({ color: '#333' }),
            stroke: new Stroke({ 
              color: '#fff', 
              width: isSelected ? 4 : 3  // Thicker text outline for selected elements
            }),
            offsetY: -20
          })
        }));

        markerFeature.set('manualElement', true);
        this.vectorSource.addFeature(markerFeature);
      });
      
      // If track has multiple waypoints, create a line connecting them
      if (lineCoordinates.length > 1) {
        const lineFeature = new Feature({
          geometry: new LineString(lineCoordinates),
          name: `${track.name}-line`,
          trackId: track.id
        });
        
        // Enhanced line styling for selected track
        const lineWidth = isSelected ? 5 : 3;  // Wider line for selected track
        
        lineFeature.setStyle(new Style({
          stroke: new Stroke({
            color: trackColor,
            width: lineWidth,
            lineDash: isSelected ? [5, 8] : [1, 5]  // Different dash pattern for selected track
          })
        }));
        
        lineFeature.set('trackLine', true);
        this.vectorSource.addFeature(lineFeature);
      }
    });
  }

  closeElementDetails(): void {
    this.elementDetailsVisible = false;
    this.selectedElement = null;
    this.selectedTrackId = null;  // Clear the selected track ID
    
    // Update the markers to remove highlighting
    this.updateManualTrackMarkers();
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

  /**
   * Convert Western numerals to Arabic numerals
   */
  convertToArabicNumerals(text: string): string {
    // Define Arabic numerals mapping
    const arabicNumerals: { [key: string]: string } = {
      '0': '٠',
      '1': '١',
      '2': '٢',
      '3': '٣',
      '4': '٤',
      '5': '٥',
      '6': '٦',
      '7': '٧',
      '8': '٨',
      '9': '٩'
    };
    return text.replace(/[0-9]/g, match => arabicNumerals[match] || match);
  }

  /**
   * Get the hours in appropriate numerals based on the selected language
   */
  getHours(): string[] {
    const hoursForSelect = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    if (this.useArabic) {
      return hoursForSelect.map(hour => this.convertToArabicNumerals(hour));
    }
    return hoursForSelect;
  }

  /**
   * Get the minutes in appropriate numerals based on the selected language
   */
  getMinutes(): string[] {
    const minutesForSelect = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', 
      '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 
      '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', 
      '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', 
      '51', '52', '53', '54', '55', '56', '57', '58', '59'];
    if (this.useArabic) {
      return minutesForSelect.map(minute => this.convertToArabicNumerals(minute));
    }
    return minutesForSelect;
  }

  /**
   * Handle time change event from time picker component
   * @param time - The selected time in HH:MM format
   */
  onTimeChange(time: string): void {
    this.selectedTime = time; // time is already in HH:MM format from the time picker
    this.setExternalPickersFromSelectedTime();
    console.log('Map Component - Time changed to:', this.selectedTime);
    
    // Here you can add any additional logic to update map elements based on time
    // For example, show/hide features, change styling, etc.
    
    // Example: Update the map title to show the selected time
    const mapTitle = document.querySelector('.ol-attribution') as HTMLElement;
    if (mapTitle) {
      const timeLabel = this.useArabic ? 'الوقت:' : 'Time:';
      mapTitle.innerHTML = `${timeLabel} ${this.selectedTime}`;
    }
  }

  /**
   * Delete a manual track
   * @param trackId - ID of the track to delete
   */
  deleteManualTrack(trackId: number): void {
    if (confirm('Are you sure you want to delete this track?')) {
      this.manualTracksService.removeTrack(trackId);
      
      // If the deleted track was selected, close the element details panel
      if (trackId === this.selectedTrackId) {
        this.closeElementDetails();
      }
    }
  }

  /**
   * Get text for UI labels based on selected language
   */
  getLabel(english: string, arabic: string): string {
    return this.useArabic ? arabic : english;
  }

  /**
   * Toggle between Arabic and English interfaces
   */
  toggleLanguage(): void {
    this.useArabic = !this.useArabic;
    console.log('Language changed to:', this.useArabic ? 'Arabic' : 'English');
  }

  setExternalPickersFromSelectedTime(): void {
    if (this.selectedTime) {
      const [hours, minutes] = this.selectedTime.split(':');
      this.externalHour = hours.padStart(2, '0');
      this.externalMinute = minutes.padStart(2, '0');
    }
  }

  onExternalPickerChange(): void {
    this.selectedTime = `${this.externalHour.padStart(2, '0')}:${this.externalMinute.padStart(2, '0')}`;
    // Optionally, trigger any logic that should happen when selectedTime changes
  }

  toggleSearchPanel(): void {
    this.showSearchPanel = !this.showSearchPanel;
  }

  onSearchPanelItemSelected(item: { id: number, name: string }): void {
    this.selectedItem = item;
  }
}
