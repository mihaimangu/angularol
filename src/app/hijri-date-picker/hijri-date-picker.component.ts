import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-hijri-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  templateUrl: './hijri-date-picker.component.html',
  styleUrl: './hijri-date-picker.component.scss'
})
export class HijriDatePickerComponent implements OnInit {
  @Input() selectedDate: Date = new Date();
  @Input() label: string = 'التاريخ الهجري';
  @Input() placeholder: string = 'يوم/شهر/سنة هـ';
  
  @Output() dateChange = new EventEmitter<Date>();

  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit(): void {
    // Set to Arabic locale for Hijri calendar
    this.dateAdapter.setLocale('ar-SA');
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
      this.dateChange.emit(date);
    }
  }

  getLabel(): string {
    return this.label;
  }

  getPlaceholder(): string {
    return this.placeholder;
  }
}
