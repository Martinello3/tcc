import { Injectable } from '@angular/core';

export interface SavedFormation {
  id: string;
  name: string;
  formationId: string;
  formationName: string;
  players: any[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FormationStorageService {
  private readonly STORAGE_KEY = 'saved-formations';

  saveFormation(formation: Omit<SavedFormation, 'id' | 'createdAt' | 'updatedAt'>): SavedFormation {
    const savedFormations = this.getAllFormations();
    const existingIndex = savedFormations.findIndex(f => f.formationId === formation.formationId);
    
    const savedFormation: SavedFormation = {
      id: existingIndex >= 0 ? savedFormations[existingIndex].id : this.generateId(),
      ...formation,
      createdAt: existingIndex >= 0 ? savedFormations[existingIndex].createdAt : new Date(),
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      savedFormations[existingIndex] = savedFormation;
    } else {
      savedFormations.push(savedFormation);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedFormations));
    return savedFormation;
  }

  getAllFormations(): SavedFormation[] {
    try {
      const formations = localStorage.getItem(this.STORAGE_KEY);
      return formations ? JSON.parse(formations).map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt)
      })) : [];
    } catch {
      return [];
    }
  }

  getFormationById(id: string): SavedFormation | null {
    const formations = this.getAllFormations();
    return formations.find(f => f.id === id) || null;
  }

  deleteFormation(id: string): boolean {
    const formations = this.getAllFormations();
    const filteredFormations = formations.filter(f => f.id !== id);
    
    if (filteredFormations.length !== formations.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFormations));
      return true;
    }
    return false;
  }

  getFormationsByType(formationId: string): SavedFormation[] {
    return this.getAllFormations().filter(f => f.formationId === formationId);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

