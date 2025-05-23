import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attraction } from '../services/attractions.service';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss'
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