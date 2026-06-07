import { Injectable } from '@angular/core';

/**
 * Configuration service that loads environment variables
 * For development: reads from .env file via a build process
 * For production: reads from environment variables set on the deployment platform
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: { [key: string]: string } = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    // Try to load from window.__ENV__ (set by build process or server)
    if (typeof (window as any).__ENV__ !== 'undefined') {
      this.config = (window as any).__ENV__;
      console.log('✅ Config loaded from window.__ENV__');
    }
    // If not available, try to load from localStorage (for development)
    else if (typeof localStorage !== 'undefined') {
      const storedConfig = localStorage.getItem('__AI_CONFIG__');
      if (storedConfig) {
        try {
          this.config = JSON.parse(storedConfig);
          console.log('✅ Config loaded from localStorage');
        } catch (e) {
          console.warn('⚠️ Failed to parse stored config');
        }
      }
    }
  }

  /**
   * Get a configuration value by key
   * @param key Configuration key (e.g., 'GEMINI_API_KEY')
   * @param defaultValue Default value if key not found
   */
  get(key: string, defaultValue: string = ''): string {
    return this.config[key] || defaultValue;
  }

  /**
   * Set a configuration value
   * @param key Configuration key
   * @param value Configuration value
   */
  set(key: string, value: string): void {
    this.config[key] = value;
  }

  /**
   * Get all configuration values
   */
  getAll(): { [key: string]: string } {
    return { ...this.config };
  }

  /**
   * Load configuration from object (useful for testing)
   */
  loadFromObject(config: { [key: string]: string }): void {
    this.config = { ...config };
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!this.config['GEMINI_API_KEY'];
  }
}
