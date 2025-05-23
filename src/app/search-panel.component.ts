import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attraction } from './services/attractions.service';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpened" style="width: 250px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); padding: 16px;">
      <input 
        type="text" 
        [(ngModel)]="searchQuery" 
        (input)="onSearchQueryChange()" 
        placeholder="Search items..." 
        style="width: 100%; padding: 6px 8px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ccc;" />
      <ul style="list-style: none; padding: 0; margin: 0; max-height: 180px; overflow-y: auto;">
        <li *ngFor="let item of searchResults" 
            (click)="selectSearchItem(item)"
            [style.background]="selectedItem?.id === item.id ? '#3f51b5' : 'transparent'"
            [style.color]="selectedItem?.id === item.id ? 'white' : 'black'"
            style="padding: 6px 8px; border-radius: 4px; cursor: pointer; margin-bottom: 2px;">
          {{ item.name }}
        </li>
      </ul>
    </div>
  `
})
export class SearchPanelComponent {
  @Input() items: Attraction[] = [];
  @Input() isOpened: boolean = false;
  @Output() itemSelected = new EventEmitter<Attraction>();

  searchQuery: string = '';
  searchResults: Attraction[] = [];
  selectedItem: Attraction | null = null;

  ngOnInit() {
    this.searchResults = [...this.items];
  }

  onSearchQueryChange(): void {
    const query = this.searchQuery.toLowerCase();
    this.searchResults = this.items.filter(item => item.name.toLowerCase().includes(query));
  }

  selectSearchItem(item: Attraction): void {
    this.selectedItem = item;
    this.itemSelected.emit(item);
  }
} 