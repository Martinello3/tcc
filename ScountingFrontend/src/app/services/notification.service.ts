import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  
  public readonly notifications$ = this.notifications.asReadonly();

  showSuccess(title: string, message: string, duration: number = 3000) {
    this.addNotification('success', title, message, duration);
  }

  showError(title: string, message: string, duration: number = 5000) {
    this.addNotification('error', title, message, duration);
  }

  showWarning(title: string, message: string, duration: number = 4000) {
    this.addNotification('warning', title, message, duration);
  }

  showInfo(title: string, message: string, duration: number = 3000) {
    this.addNotification('info', title, message, duration);
  }

  private addNotification(type: Notification['type'], title: string, message: string, duration: number) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    this.notifications.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  removeNotification(id: string) {
    this.notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clearAll() {
    this.notifications.set([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

