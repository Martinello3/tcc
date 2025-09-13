import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="container py-3">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <div>
      <h3 class="m-0"><i class="bi bi-speedometer2 text-success"></i> Dashboard</h3>
      <small class="text-muted">Visão geral do sistema</small>
    </div>
    <div class="page-header-actions"><!-- ações futuras --></div>
  </div>

  <div class="row g-3">
    <div class="col-md-4">
      <div class="card shadow-sm h-100">
        <div class="card-body d-flex align-items-center">
          <i class="bi bi-graph-up-arrow text-success" style="font-size: 2rem"></i>
          <div class="ms-2">
            <div class="text-muted small">Relatórios recentes</div>
            <div class="fs-5 fw-semibold">12</div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm h-100">
        <div class="card-body d-flex align-items-center">
          <i class="bi bi-person-bounding-box text-success" style="font-size: 2rem"></i>
          <div class="ms-2">
            <div class="text-muted small">Jogadores avaliados</div>
            <div class="fs-5 fw-semibold">34</div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm h-100">
        <div class="card-body d-flex align-items-center">
          <i class="bi bi-camera-reels text-success" style="font-size: 2rem"></i>
          <div class="ms-2">
            <div class="text-muted small">Vídeos recentes</div>
            <div class="fs-5 fw-semibold">6</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})
export class DashboardComponent {}

