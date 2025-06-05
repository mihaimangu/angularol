import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar-SA';
import localeEn from '@angular/common/locales/en';

import { routes } from './app.routes';

// Register locales
registerLocaleData(localeAr);
registerLocaleData(localeEn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'ar-SA' } // Default to Arabic locale
  ]
};
