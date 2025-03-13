import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss'
})
export class ContextMenuComponent {
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() visible: boolean = false;
  @Output() createTrack = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  /**
   * Close the context menu when clicking outside of it
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if the click was outside the context menu
    if (this.visible && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  /**
   * Close the context menu when pressing escape
   */
  @HostListener('document:keydown.escape', [])
  onEscapePress(): void {
    if (this.visible) {
      this.closeMenu();
    }
  }

  /**
   * Handle the create track button click
   */
  onCreateTrack(): void {
    this.createTrack.emit();
    this.closeMenu();
  }

  /**
   * Close the context menu
   */
  closeMenu(): void {
    this.visible = false;
    this.close.emit();
  }
}
