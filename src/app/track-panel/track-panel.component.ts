import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TrackCoordinate {
  lon: number;
  lat: number;
}

@Component({
  selector: 'app-track-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './track-panel.component.html',
  styleUrl: './track-panel.component.scss'
})
export class TrackPanelComponent {
  @Input() visible: boolean = false;
  @Input() coordinates: TrackCoordinate[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{name: string, startingPosition: TrackCoordinate}>();

  trackName: string = '';

  /**
   * Close the track panel
   */
  closePanel(): void {
    this.visible = false;
    this.close.emit();
  }

  /**
   * Save the track with name and starting position
   */
  saveTrack(): void {
    if (this.trackName.trim() && this.coordinates.length > 0) {
      this.save.emit({
        name: this.trackName,
        startingPosition: this.coordinates[0]
      });
      this.trackName = '';
      this.closePanel();
    }
  }

  /**
   * Format coordinates for display
   */
  formatCoordinate(coord: TrackCoordinate): string {
    return `Lat: ${coord.lat.toFixed(6)}, Lon: ${coord.lon.toFixed(6)}`;
  }
}
