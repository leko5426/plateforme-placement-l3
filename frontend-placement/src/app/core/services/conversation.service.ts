import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private readonly base = `${environment.apiUrl}/conversations`;

  public enTrainDecrire = signal<boolean>(false);
  public messagesConversationCourante = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  demarrerConversation(destinataireId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.base}`, { destinataireId });
  }

  lister(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.base}`);
  }

  obtenirMessages(conversationId: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.base}/${conversationId}/messages`)
      .pipe(tap((messages) => this.messagesConversationCourante.set(messages ?? [])));
  }

  envoyerMessage(conversationId: string, contenu: string) {
    return this.http
      .post<any>(`${this.base}/${conversationId}/messages`, { contenu })
      .subscribe({
        next: (messageCree) => {
          if (messageCree) {
            this.messagesConversationCourante.update((actuels) => [...actuels, messageCree]);
          }
        },
        error: (err) => console.error("Erreur lors de l'envoi du message", err),
      });
  }

  // --- GESTION DES SOCKETS / TEMPS RÉEL ---
  connecter() {}

  deconnecter() {}

  rejoindreConversation(conversationId: string) {}

  signalerFrappe(conversationId: string) {}
}