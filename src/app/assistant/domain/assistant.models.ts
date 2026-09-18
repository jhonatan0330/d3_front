export type AssistantMessageType =
    | 'user'
    | 'assistant'
    | 'system';

export type AssistantState =
    | 'idle'
    | 'listening'
    | 'thinking'
    | 'searching'
    | 'success'
    | 'error';

export type AssistantIntent =
    {
        tipo: 'buscar-por-codigo';
        parametro: string;
    }
    | {
        tipo: 'buscar-modulo';
        parametro: string;
    }
    | {
        tipo: 'vacio';
    }
    | {
        tipo: 'desconocido';
        parametro: string;
    };


export interface AssistantResult {
    state: AssistantState;
    message: AssistantMessage;
    close?:boolean;
}

export type DocumentActionFieldType = 'text' | 'number' | 'date' | 'option';

export interface DocumentActionField {
    codigo: string;
    tipo: DocumentActionFieldType;
    valor: string | number;
}

export interface CreateDocumentAction {
    accion: 'crear-documento';
    plantilla: string;
    campos: DocumentActionField[];
    requiereConfirmacion: true;
}

export interface ParsedAssistantResponse {
    text: string;
    action?: CreateDocumentAction;
    json?: string;
}


export interface AssistantMessage {
    id: string;
    type: AssistantMessageType;
    text: string;
    date: Date;
    documents?: DocumentSearchResult[];
    templates?: TemplateSearchResult[];
    action?: CreateDocumentAction;
    actionJson?: string;
}

export interface TemplateData {
    llaveTabla: string;
    server?: string;
    proceso?: string;
    tipo: string;
}

export interface DocumentSearchResult {
    llaveTabla: string;
    nombre: string;
    descripcion: string;
    imagen: string;
    server?: string;
    plantilla?: string;
    nombrePlantilla?: string;
}

export interface TemplateSearchResult {
    llaveTabla: string;
    nombre: string;
    codigo: string;
    imagen: string;
    server?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

export interface ChatResponse {
  choices: {
    message: {
      role: 'assistant';
      content: string;
    };
  }[];
}