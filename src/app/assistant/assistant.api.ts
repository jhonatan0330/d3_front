import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStoreService } from 'app/shared/local-store.service';
import { ChatMessage, ChatRequest, ChatResponse } from './domain/assistant.models';



@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly http = inject(HttpClient);
  private readonly ls = inject(LocalStoreService);

  sendMessage(messages: ChatMessage[]): Observable<ChatResponse> {

    const request: ChatRequest = {
      messages
    };

    return this.http.post<ChatResponse>(
      this.ls.getUrlAccess('/assistant/chat'),
      request
    );
  }
}