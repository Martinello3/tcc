import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentActivityWidgetComponent } from '../../components/recent-activity/recent-activity.widget';
import { FocusedPlayersWidgetComponent } from '../../components/focused-players/focused-players.widget';
import { RemindersTasksWidgetComponent } from '../../components/reminders-tasks/reminders-tasks.widget';
import { MapeamentoPotencialWidgetComponent } from './widgets/mapeamento-potencial.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RecentActivityWidgetComponent, FocusedPlayersWidgetComponent, RemindersTasksWidgetComponent, MapeamentoPotencialWidgetComponent],
  template: `
<div class="container py-3">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <div>
      <h3 class="m-0"><i class="bi bi-speedometer2 text-success"></i> Dashboard</h3>
      <small class="text-muted">Visão geral do sistema</small>
    </div>
    <div class="page-header-actions"><!-- ações futuras --></div>
  </div>

  <div class="row g-3 mt-2">
    <div class="col-md-8 d-flex flex-column gap-3">
      <app-focused-players-widget />
      <app-mapeamento-potencial-widget />
      <app-recent-activity-widget />
    </div>
    <div class="col-md-4">
      <app-reminders-tasks-widget />
    </div>
  </div>
</div>
  `
})
export class DashboardComponent {}

