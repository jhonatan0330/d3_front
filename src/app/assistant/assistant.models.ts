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
        tipo: 'buscar-por-arroba';
        parametro: string;
    }
    | {
        tipo: 'buscar-por-arroba-vacio';
    }
    | {
        tipo: 'buscar-template-por-slash';
        parametro: string;
    }
    | {
        tipo: 'desconocido';
    };


export interface AssistantResult {
    state: AssistantState;
    message: AssistantMessage;
    close?:boolean;
}


export interface AssistantMessage {
    id: string;
    type: AssistantMessageType;
    text: string;
    date: Date;
    documents?: DocumentSearchResult[];
    templates?: TemplateSearchResult[];
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
