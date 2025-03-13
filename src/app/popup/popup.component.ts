import { Component, Input, Output, EventEmitter, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent implements OnInit, AfterViewInit {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() link: string = '';
  @Input() linkText: string = 'Learn more';
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    // Component is fully rendered
  }

  closePopup(): void {
    this.visible = false;
    this.close.emit();
  }

  /**
   * Get the native element of the popup for positioning
   */
  getElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
