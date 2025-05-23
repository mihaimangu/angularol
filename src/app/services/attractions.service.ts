import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AttractionsService {
  private mockAttractions = [
    { id: 1, name: 'Eiffel Tower' },
    { id: 2, name: 'Champ de Mars' },
    { id: 3, name: 'Trocadéro Gardens' },
    { id: 4, name: 'Seine River Cruise' },
    { id: 5, name: 'Musée du Quai Branly' },
    { id: 6, name: "Pont d'Iéna" },
    { id: 7, name: 'Palais de Chaillot' },
    { id: 8, name: 'Rue Cler Market Street' },
    { id: 9, name: 'Les Invalides' },
    { id: 10, name: 'Bir-Hakeim Bridge' }
  ];

  getAttractions(): Observable<{ id: number, name: string }[]> {
    // Simulate HTTP delay
    return of(this.mockAttractions).pipe(delay(500));
  }
} 