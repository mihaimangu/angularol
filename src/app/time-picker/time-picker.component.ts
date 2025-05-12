import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * A standalone time picker component with support for Arabic and English languages.
 * Provides hour, minute and AM/PM selection with proper time formatting.
 */
@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements OnInit {
  // Inputs
  @Input() useArabic: boolean = false;
  @Input() selectedTime: string = new Date().toTimeString().slice(0, 5);
  @Input() defaultTime: string = '06:23'; // Default time (6:23 AM)
  
  // Outputs
  @Output() timeChange = new EventEmitter<string>();
  
  // Component properties
  selectedHour: string = '06';
  selectedMinute: string = '00';
  selectedAmPm: string = 'AM';
  
  // Arabic numerals mapping
  private arabicNumerals: { [key: string]: string } = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  };
  
  // Hour options for select
  hoursForSelect: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  
  // Minute options for select
  minutesForSelect: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', 
    '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 
    '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', 
    '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', 
    '51', '52', '53', '54', '55', '56', '57', '58', '59'];
    
  // AM/PM options
  amPmOptions: string[] = ['AM', 'PM'];
  
  ngOnInit(): void {
    // Use defaultTime if provided, otherwise use selectedTime
    this.selectedTime = this.defaultTime || this.selectedTime;
    this.initializeTimeSelects();
    
    // Initial time change event emission
    this.updateTime();
  }
  
  /**
   * Convert Western numerals to Arabic numerals
   * @param text Text containing Western numerals to convert
   * @returns Text with converted Arabic numerals
   */
  convertToArabicNumerals(text: string): string {
    return text.replace(/[0-9]/g, match => this.arabicNumerals[match] || match);
  }
  
  /**
   * Update the selected time when hour, minute, or AM/PM changes
   */
  updateTime(): void {
    // Convert 12-hour format to 24-hour format for the input
    let hour = parseInt(this.selectedHour);
    if (this.selectedAmPm === 'PM' && hour < 12) {
      hour += 12;
    } else if (this.selectedAmPm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    // Format the time as HH:MM
    const formattedHour = hour.toString().padStart(2, '0');
    this.selectedTime = `${formattedHour}:${this.selectedMinute}`;
    
    // Emit the time change event with HH:MM format
    this.timeChange.emit(this.selectedTime);
    console.log('Time Picker - Time changed to:', this.selectedTime);
  }
  
  /**
   * Initialize the time selects from the input value
   */
  initializeTimeSelects(): void {
    if (this.selectedTime) {
      const [hours, minutes] = this.selectedTime.split(':');
      let hour = parseInt(hours);
      let amPm = 'AM';
      
      // Convert from 24-hour to 12-hour format
      if (hour >= 12) {
        amPm = 'PM';
        if (hour > 12) {
          hour -= 12;
        }
      } else if (hour === 0) {
        hour = 12;
      }
      
      this.selectedHour = hour.toString().padStart(2, '0');
      this.selectedMinute = minutes;
      this.selectedAmPm = amPm;
    }
  }
  
  /**
   * Get the current time as a formatted string in HH:MM format
   * @returns Time string in 24-hour format (HH:MM)
   */
  getTimeString(): string {
    // Make sure we're returning the time in HH:MM format
    return this.selectedTime;
  }
  
  /**
   * Format the time for display with Arabic support
   * @returns Formatted time string with appropriate language formatting
   */
  formatTime(): string {
    if (this.selectedTime) {
      // Create a Date object with today's date and the selected time
      const today = new Date();
      const timeDate = new Date(today.toDateString() + ' ' + this.selectedTime);
      
      // Get standard English format for debugging
      const englishTime = timeDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
  
      // Return formatted time in Arabic locale if enabled
      if (this.useArabic) {
        const arabicHour = this.convertToArabicNumerals(this.selectedHour);
        const arabicMinute = this.convertToArabicNumerals(this.selectedMinute);
        const arabicAmPm = (this.selectedAmPm === 'AM') ? 'ص' : 'م';
        
        // Manual Arabic time format
        const arabicTimeWithNumerals = `${arabicHour}:${arabicMinute} ${arabicAmPm}`;
        
        // Return both for reference
        return `<span class="arabic-numerals">${arabicTimeWithNumerals}</span> <span class="english-debug">(${englishTime}) [${this.getTimeString()}]</span>`;
      } else {
        // Return standard format with 24-hour format in brackets for reference
        return `${englishTime} [${this.getTimeString()}]`;
      }
    }
    return '';
  }
}
