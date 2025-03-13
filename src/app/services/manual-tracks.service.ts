import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TrackCoordinate } from '../track-panel/track-panel.component';

export interface ManualTrack {
  id: number;
  name: string;
  startingPosition: TrackCoordinate;
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

  debugTracks(): void {
    console.log('Current manual tracks:', this.tracks);
  }
} 