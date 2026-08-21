import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateNotificationService {
  private readonly _date = signal<Date | null>(null);

  setDate(date: Date | string | null) {
    if (!date) {
      this._date.set(null);
      return;
    }
    const newDate = (date instanceof Date) ? date : new Date(date);
    this._date.set(newDate);
  }

  clearDate() {
    this._date.set(null);
  }

  get date() {
    return this._date.asReadonly();
  }
}
