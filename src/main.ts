import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { ConfigService } from './app/core/services/config.service';

function initializeConfig(configService: ConfigService) {
  return () => {
    // For development: load from .env via public/config.json
    // For production: set via environment variables on the platform
    const apiKey = (window as any).__GEMINI_API_KEY__;
    if (apiKey) {
      configService.set('GEMINI_API_KEY', apiKey);
    }
    return Promise.resolve();
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfigService],
      multi: true
    }
  ]
}).catch(err => console.error(err));
