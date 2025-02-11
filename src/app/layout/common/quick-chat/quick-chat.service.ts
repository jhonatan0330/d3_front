import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({
  providedIn: 'root'
})
export class QuickChatService {
  private chat: Chat;
  private chats: Chat[] = [];
  private _chat: BehaviorSubject<Chat> = new BehaviorSubject(null);
  private _chats: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>(null);
  
  constructor() {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  get chat$(): Observable<Chat> {
    return this._chat.asObservable();
  }

  get chats$(): Observable<Chat[]> {
    return this._chats.asObservable();
  }

  setChats(value) {
    this.chats = value;
    this._chats.next(this.chats);
  }

  getAllChats() {
    this._chats.next(this.chats);
  }

  setChat(value) {
    this.chat = value;
    this._chat.next(this.chat);
  }

 
}
