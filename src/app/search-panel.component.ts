import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="width: 250px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); padding: 16px;">
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
  @Input() items: { id: number, name: string }[] = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' },
    { id: 4, name: 'Date' },
    { id: 5, name: 'Elderberry' },
    { id: 6, name: 'Fig' },
    { id: 7, name: 'Grape' },
    { id: 8, name: 'Honeydew' }
  ];
  @Output() itemSelected = new EventEmitter<{ id: number, name: string }>();

  searchQuery: string = '';
  searchResults: { id: number, name: string }[] = [...this.items];
  selectedItem: { id: number, name: string } | null = null;

  ngOnInit() {
    this.searchResults = [...this.items];
  }

  onSearchQueryChange(): void {
    const query = this.searchQuery.toLowerCase();
    this.searchResults = this.items.filter(item => item.name.toLowerCase().includes(query));
  }

  selectSearchItem(item: { id: number, name: string }): void {
    this.selectedItem = item;
    this.itemSelected.emit(item);
  }
} 