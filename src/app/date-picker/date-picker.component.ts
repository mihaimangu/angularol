import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar-SA';
import localeEn from '@angular/common/locales/en';

// Register locales
registerLocaleData(localeAr);
registerLocaleData(localeEn);

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],

  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() selectedDate: Date = new Date();
  @Input() useArabic: boolean = false; // This component is for English/Gregorian dates
  @Input() label: string = 'Date';
  @Input() placeholder: string = 'MM/DD/YYYY';
  
  @Output() dateChange = new EventEmitter<Date>();



  constructor(
    private dateAdapter: DateAdapter<Date>,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize with English locale for Gregorian dates
    this.dateAdapter.setLocale('en-US');
  }

  ngOnInit(): void {
    // Set the locale for the date adapter based on useArabic flag
    this.updateLocale();
  }

  ngAfterViewInit(): void {
    this.updateLocale();
  }

  ngOnChanges(): void {
    this.updateLocale();
  }

  private updateLocale(): void {
    const locale = this.useArabic ? 'ar-SA' : 'en-US';
    this.dateAdapter.setLocale(locale);
    
    // Configure Arabic date formatting
    if (this.useArabic) {
      this.dateAdapter.setLocale('ar-SA');
      // Ensure we're using Gregorian calendar, not Hijri
      const dateOptions = {
        year: 'numeric' as const,
        month: 'long' as const,
        day: 'numeric' as const,
        calendar: 'gregory' as const
      };
    }
    
    // Force change detection to update the calendar
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
      this.dateChange.emit(date);
    }
  }

  getLabel(): string {
    return this.useArabic ? 'التاريخ' : this.label;
  }

  getPlaceholder(): string {
    return this.useArabic ? 'شش/يي/سسسس' : this.placeholder;
  }
}
