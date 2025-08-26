import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HealthComponent } from './components/health/health.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HealthComponent],
  template: '<router-outlet />',
  styleUrl: './app.scss'
})
export class App {}
