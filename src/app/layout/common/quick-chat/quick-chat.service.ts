import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { LocalStoreService } from 'app/shared/local-store.service';

@Injectable({
  providedIn: 'root'
})
export class QuickChatService {
  private _chat: BehaviorSubject<Chat> = new BehaviorSubject(null);
  private _chats: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>(null);
  private _useMock: boolean = true;
  private _mockChats: Chat[] = [
    {
      id: 'indicators',
      contactId: '0',
      contact: {
        id: '0',
        name: 'Indicadores',
        avatar: 'assets/images/img-test/indicators.png',
        about: 'Resumen de indicadores clave',
      },
      unreadCount: 0,
      muted: true,
      lastMessage: 'Resumen: 21 tareas pendientes hoy.',
      lastMessageAt: new Date().toISOString(),
    },
    {
      id: '1',
      contactId: '1',
      contact: {
        id: '1',
        name: 'Juan Pérez',
        avatar: 'assets/images/img-test/male-01.jpg',
        about: 'Desarrollador Frontend en ACME Corp',
        details: {
          emails: [
            { email: 'juan.perez@acme.com', label: 'Work' },
            { email: 'jperez.personal@gmail.com', label: 'Personal' }
          ],
          phoneNumbers: [
            { country: 'Colombia', phoneNumber: '+573003001112', label: 'Mobile' },
            { country: 'Colombia', phoneNumber: '+5712345678', label: 'Home' }
          ],
          title: 'Frontend Developer',
          company: 'ACME Corp',
          address: 'Bogotá, Colombia',
          birthday: '1992-03-15T00:00:00Z'
        }
      },
      unreadCount: 3,
      muted: false,
      lastMessage: 'No olvides revisar el último commit.',
      lastMessageAt: new Date(Date.now()).toISOString(),
      messages: [
        {
          id: 'm1',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Hola Juan, ¿cómo va todo?',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutos atrás
        },
        {
          id: 'm2',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: '¡Hola! Todo bien, trabajando en el nuevo módulo.',
          createdAt: new Date(Date.now() - 29 * 60 * 1000).toISOString()
        },
        {
          id: 'm3',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Perfecto. ¿Cuándo crees que puedas hacer el PR?',
          createdAt: new Date(Date.now() - 27 * 60 * 1000).toISOString()
        },
        {
          id: 'm4',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: 'Hoy mismo lo termino y lo subo.',
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
        },
        {
          id: 'm5',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Genial. Reviso apenas esté listo.',
          createdAt: new Date(Date.now() - 23 * 60 * 1000).toISOString()
        },
        {
          id: 'm6',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: 'No olvides revisar el último commit.',
          createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
        },
        {
          id: 'm7',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: '¿Me compartes el enlace del repo?',
          createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
        },
        {
          id: 'm8',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: 'Claro, aquí está: https://github.com',
          createdAt: new Date(Date.now() - 17 * 60 * 1000).toISOString()
        },
        {
          id: 'm9',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Gracias, lo reviso ahora mismo.',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'm10',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: 'Si necesitas algún ajuste, me avisas.',
          createdAt: new Date(Date.now() - 13 * 60 * 1000).toISOString()
        },
        {
          id: 'm11',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Listo, vi que la gráfica 2 necesita un ajuste.',
          createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString()
        },
        {
          id: 'm12',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: 'Entendido, lo corrijo ahora mismo.',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: 'm13',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Gracias, avísame cuando esté listo.',
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        {
          id: 'm14',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: 'Listo, ya está corregido y subido.',
          createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
        },
        {
          id: 'm15',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Perfecto, buen trabajo. ¡Gracias!',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 'm16',
          chatId: '1',
          contactId: '1',
          isMine: true,
          value: '¡De nada! Avísame si surge algo más.',
          createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
        },
        {
          id: 'm17',
          chatId: '1',
          contactId: '1',
          isMine: false,
          value: 'Por ahora todo bien. ¡Seguimos en contacto!',
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: '2',
      contactId: '2',
      contact: {
        id: '2',
        name: 'Ramón Trujillo',
        avatar: 'assets/images/img-test/male-02.jpg',
        about: 'Gerente de Proyecto',
        details: {
          emails: [{ email: 'maria.gomez@empresa.com', label: 'Work' }],
          phoneNumbers: [{ country: 'México', phoneNumber: '+525544334455', label: 'Mobile' }],
          title: 'Project Manager',
          company: 'Empresa XYZ',
        },
      },
      unreadCount: 1,
      muted: false,
      lastMessage: '¿Me envías el informe?',
      lastMessageAt: new Date().toISOString(),
      messages: [
        {
          id: 'm6',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: '¿Me envías el informe?',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: '3',
      contactId: '3',
      contact: {
        id: '2',
        name: 'Armando Gonzalez',
        avatar: 'assets/images/img-test/male-03.jpg',
        about: 'Gerente de Proyecto',
        details: {
          emails: [
            { email: 'ramon.trujillo@empresa.com', label: 'Work' }
          ],
          phoneNumbers: [
            { country: 'México', phoneNumber: '+52 5544334455', label: 'Mobile' }
          ],
          title: 'Project Manager',
          company: 'Empresa XYZ'
        }
      },
      unreadCount: 2,
      muted: false,
      lastMessage: 'Gracias, quedo pendiente del avance.',
      lastMessageAt: new Date(Date.now()).toISOString(),
      messages: [
        {
          id: 'm1',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: 'Buenos días, ¿cómo vas con el informe del proyecto?',
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hora atrás
        },
        {
          id: 'm2',
          chatId: '2',
          contactId: '2',
          isMine: true,
          value: '¡Buenos días, Ramón! Estoy avanzando, ya terminé la sección inicial.',
          createdAt: new Date(Date.now() - 58 * 60 * 1000).toISOString()
        },
        {
          id: 'm3',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: 'Perfecto. Recuerda incluir los KPI del segundo trimestre.',
          createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString()
        },
        {
          id: 'm4',
          chatId: '2',
          contactId: '2',
          isMine: true,
          value: 'Entendido, lo agrego ahora. ¿Algo más que deba tener en cuenta?',
          createdAt: new Date(Date.now() - 53 * 60 * 1000).toISOString()
        },
        {
          id: 'm5',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: 'Sí, añade también el resumen del cliente en la última sección.',
          createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
        },
        {
          id: 'm6',
          chatId: '2',
          contactId: '2',
          isMine: true,
          value: 'Listo, Ramón. He incluido los KPI y el resumen. Te lo envío para revisión en 15 minutos.',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
          id: 'm7',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: 'Excelente. Quedo pendiente de tu envío.',
          createdAt: new Date(Date.now() - 43 * 60 * 1000).toISOString()
        },
        {
          id: 'm8',
          chatId: '2',
          contactId: '2',
          isMine: true,
          value: 'Informe enviado. Si necesitas algún ajuste, me avisas.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'm9',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: 'Lo acabo de revisar, se ve muy bien. Solo ajusta la gráfica 3 para incluir los últimos datos.',
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
        },
        {
          id: 'm10',
          chatId: '2',
          contactId: '2',
          isMine: true,
          value: 'Perfecto, en unos minutos te envío la versión corregida.',
          createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
        },
        {
          id: 'm11',
          chatId: '2',
          contactId: '2',
          isMine: false,
          value: 'Gracias, quedo pendiente del avance.',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      ]
    }
  ];

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private ls: LocalStoreService) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for chat
   */
  get chat$(): Observable<Chat> {
    return this._chat.asObservable();
  }

  /**
   * Getter for chat
   */
  get chats$(): Observable<Chat[]> {
    return this._chats.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get chats
   */
  getChats(): Observable<any> {
    return this._httpClient.get<Chat[]>(this.ls.getUrlAccess('/authentication/getLinkedOrganizations', null)).pipe(
      tap((response: Chat[]) => {
        const allChats = this._useMock ? this._mockChats : response;
        this._chats.next(allChats);
      })
    );
  }

  /**
   * Get chat
   *
   * @param id
   */
  getChatById(id: string): Observable<any> {
    const chat = this._useMock ? this._mockChats.find(c => c.id === id) : null;
    if (this._useMock && chat) {
      this._chat.next(chat);
      return of(chat);
    }
    return this._httpClient.get<Chat>('api/apps/chat/chat', { params: { id } }).pipe(
      map((chat) => {

        // Update the chat
        this._chat.next(chat);

        // Return the chat
        return chat;
      }),
      switchMap((chat) => {

        if (!chat) {
          return throwError('Could not found chat with id of ' + id + '!');
        }

        return of(chat);
      })
    );
  }
}
