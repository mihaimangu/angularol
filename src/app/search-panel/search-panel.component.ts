import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attraction, AttractionsService } from '../services/attractions.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss'
})
export class SearchPanelComponent {
  @Input() isOpened: boolean = false;
  @Output() itemSelected = new EventEmitter<Attraction>();

  searchQuery: string = '';
  searchResults: Attraction[] = [];
  selectedItem: Attraction | null = null;

  constructor(private attractionsService: AttractionsService) {}

  ngOnInit() {
    this.attractionsService.getResults('').subscribe(results => {
      this.searchResults = results;
    });
  }

  onSearchQueryChange(): void {
    const query = this.searchQuery.trim();
    this.attractionsService.getResults(query).subscribe(results => {
      this.searchResults = results;
    });
  }

  selectSearchItem(item: Attraction): void {
    this.selectedItem = item;
    this.itemSelected.emit(item);
  }
} 