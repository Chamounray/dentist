import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = signal(this.getInitialTheme());
  
  constructor() {
    // Apply initial theme
    this.applyTheme(this.isDarkTheme());
  }

  toggleTheme(): void {
    this.isDarkTheme.set(!this.isDarkTheme());
    this.applyTheme(this.isDarkTheme());
    localStorage.setItem('darkMode', this.isDarkTheme().toString());
  }

  isDark(): boolean {
    return this.isDarkTheme();
  }

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      return savedTheme === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}