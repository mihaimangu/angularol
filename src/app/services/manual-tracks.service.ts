import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TrackCoordinate } from '../track-panel/track-panel.component';

export interface ManualTrack {
  id: number;
  name: string;
  waypoints: TrackCoordinate[];
}

@Injectable({
  providedIn: 'root'
})
export class ManualTracksService {
  private tracks: ManualTrack[] = [];
  private tracksSubject: BehaviorSubject<ManualTrack[]> = new BehaviorSubject<ManualTrack[]>([]);

  constructor() { 
    (<any>window).manualTracksService = this;
  }

  /**
   * Adds a new manual track. Automatically assigns an id based on the current timestamp.
   * @param track - The track object without an id.
   */
  addTrack(track: Omit<ManualTrack, 'id'>): void {
    const id = new Date().getTime();
    const newTrack: ManualTrack = { id, ...track };
    this.tracks.push(newTrack);
    this.tracksSubject.next(this.tracks);
  }

  /**
   * Returns an observable of the current list of manual tracks.
   */
  getTracks(): Observable<ManualTrack[]> {
    return this.tracksSubject.asObservable();
  }

  /**
   * Removes a manual track by its id.
   * @param id - The id of the track to remove.
   */
  removeTrack(id: number): void {
    this.tracks = this.tracks.filter(track => track.id !== id);
    this.tracksSubject.next(this.tracks);
  }

  /**
   * Debug method to log the current manual tracks.
   */
  debugTracks(): void {
    console.log('Current manual tracks:', this.tracks);
  }

  /**
   * Gets a track by its ID
   * @param id - The ID of the track to get
   * @returns The track with the specified ID, or undefined if not found
   */
  getTrackById(id: number): ManualTrack | undefined {
    return this.tracks.find(track => track.id === id);
  }

  /**
   * Updates an existing track
   * @param track - The updated track (must have an ID that matches an existing track)
   */
  updateTrack(track: ManualTrack): void {
    const index = this.tracks.findIndex(t => t.id === track.id);
    if (index !== -1) {
      this.tracks[index] = track;
      this.tracksSubject.next([...this.tracks]);
    }
  }
} 