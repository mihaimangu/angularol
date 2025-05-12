# Time Picker Component

A reusable Angular time picker component with Arabic and English support.

## Features

- Standalone Angular component
- Arabic numeral support (٠-٩)
- Right-to-left (RTL) layout for Arabic mode
- Language toggle support
- AM/PM selection
- Time output in consistent 24-hour format (HH:MM)
- Customizable default time

## Usage

### In Standalone Components

```typescript
import { Component } from '@angular/core';
import { TimePickerComponent } from '../time-picker/time-picker.component';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [TimePickerComponent],
  template: `
    <app-time-picker 
      [useArabic]="isArabic"
      [defaultTime]="'06:23'"
      (timeChange)="handleTimeChange($event)">
    </app-time-picker>
  `
})
export class MyComponent {
  isArabic = false;

  handleTimeChange(time: string) {
    console.log('Selected time:', time);
  }
}
```

### In Module-based Applications

1. First, import the component in your module:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from '../time-picker/time-picker.component';

@NgModule({
  imports: [
    CommonModule,
    TimePickerComponent  // Import the standalone component
  ],
  declarations: [
    // Your module components
  ],
  exports: [
    // Include TimePickerComponent if you want to expose it to other modules
    TimePickerComponent
  ]
})
export class MyFeatureModule { }
```

2. Then use it in your component templates:

```html
<app-time-picker 
  [useArabic]="isArabic"
  [selectedTime]="currentTime"
  [defaultTime]="'06:23'"
  (timeChange)="handleTimeChange($event)">
</app-time-picker>
```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| useArabic | boolean | false | Whether to use Arabic numerals and RTL layout |
| selectedTime | string | current time | The initially selected time in HH:MM format |
| defaultTime | string | '06:23' | Default time to use if selectedTime is not provided |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| timeChange | EventEmitter<string> | Emits the selected time in HH:MM format when changed |

## Styling

The component comes with default styling but can be customized by overriding CSS variables or extending the component classes.

### RTL Support

The component automatically switches to RTL layout when `useArabic` is set to `true`.

## Example with Language Toggle

```typescript
@Component({
  selector: 'app-with-toggle',
  standalone: true,
  imports: [TimePickerComponent, CommonModule],
  template: `
    <div class="controls">
      <button (click)="toggleLanguage()">
        {{ useArabic ? 'English' : 'العربية' }}
      </button>
      
      <app-time-picker 
        [useArabic]="useArabic"
        [defaultTime]="'06:23'"
        (timeChange)="onTimeChange($event)">
      </app-time-picker>
      
      <div class="time-output">
        Selected time: {{ selectedTime }}
      </div>
    </div>
  `
})
export class WithToggleComponent {
  useArabic = false;
  selectedTime = '';
  
  toggleLanguage() {
    this.useArabic = !this.useArabic;
  }
  
  onTimeChange(time: string) {
    this.selectedTime = time;
  }
}
``` 