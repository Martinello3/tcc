import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { DialogContainerComponent } from './components/dialog-container/dialog-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, DialogContainerComponent],
  template: `
    <router-outlet />
    <app-toast-container />
    <app-dialog-container />
  `,
  styleUrl: './app.scss'
})
export class App {}
