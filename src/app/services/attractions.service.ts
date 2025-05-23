import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Attraction {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class AttractionsService {
  private mockAttractions: Attraction[] = [
    { id: 1, name: 'Eiffel Tower', lat: 48.8584, lon: 2.2945 },
    { id: 2, name: 'Champ de Mars', lat: 48.8559, lon: 2.2986 },
    { id: 3, name: 'Trocadéro Gardens', lat: 48.8625, lon: 2.2876 },
    { id: 4, name: 'Seine River Cruise', lat: 48.8570, lon: 2.2930 },
    { id: 5, name: 'Musée du Quai Branly', lat: 48.8606, lon: 2.2976 },
    { id: 6, name: "Pont d'Iéna", lat: 48.8600, lon: 2.2937 },
    { id: 7, name: 'Palais de Chaillot', lat: 48.8630, lon: 2.2887 },
    { id: 8, name: 'Rue Cler Market Street', lat: 48.8575, lon: 2.3040 },
    { id: 9, name: 'Les Invalides', lat: 48.8566, lon: 2.3126 },
    { id: 10, name: 'Bir-Hakeim Bridge', lat: 48.8532, lon: 2.2870 }
  ];

  getAttractions(): Observable<Attraction[]> {
    // Simulate HTTP delay
    return of(this.mockAttractions).pipe(delay(500));
  }
} 