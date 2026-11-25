import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  id: number;
  message: string;
  type: 'succes' | 'erreur' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private compteur = 0;
  readonly toasts = signal<ToastNotification[]>([]);

  succes(message: string) {
    this.ajouter(message, 'succes');
  }

  erreur(message: string) {
    this.ajouter(message, 'erreur');
  }

  info(message: string) {
    this.ajouter(message, 'info');
  }

  private ajouter(message: string, type: ToastNotification['type']) {
    const id = ++this.compteur;
    this.toasts.update((liste) => [...liste, { id, message, type }]);
    setTimeout(() => this.retirer(id), 5000);
  }

  retirer(id: number) {
    this.toasts.update((liste) => liste.filter((t) => t.id !== id));
  }
}
