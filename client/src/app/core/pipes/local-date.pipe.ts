import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Converts a UTC date string (from the API) to local time for display.
 * Usage: {{ someUtcDate | localDate }}
 *        {{ someUtcDate | localDate:'short' }}
 *        {{ someUtcDate | localDate:'yyyy-MM-dd HH:mm' }}
 *
 * If the value is null/undefined, returns empty string.
 * Ensures the incoming ISO string is treated as UTC before converting.
 */
@Pipe({
  name: 'localDate',
  standalone: true
})
export class LocalDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: string | Date | null | undefined, format: string = 'medium', locale?: string): string | null {
    if (!value) return '';

    // Ensure the date is treated as UTC
    let utcDate: Date;
    if (value instanceof Date) {
      utcDate = value;
    } else {
      // If the string doesn't end with 'Z' or contain timezone info, append 'Z'
      const str = value.toString();
      if (!str.endsWith('Z') && !str.includes('+') && !/\d{2}:\d{2}$/.test(str.slice(-6))) {
        utcDate = new Date(str + 'Z');
      } else {
        utcDate = new Date(str);
      }
    }

    if (isNaN(utcDate.getTime())) return '';

    // DatePipe will convert to local timezone automatically
    return this.datePipe.transform(utcDate, format, undefined, locale) ?? '';
  }
}
