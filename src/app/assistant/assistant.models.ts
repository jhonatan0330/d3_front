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

export interface AssistantAction {
    id: string;
    label: string;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
    image?: string;
}

export interface AssistantMessage {
    id: string;
    type: AssistantMessageType;
    text: string;
    date: Date;

    /**
     * Acciones que el usuario puede ejecutar
     * desde el mensaje.
     */
    actions?: AssistantAction[];

    /**
     * Datos opcionales asociados al mensaje.
     */
    data?: unknown;

    /**
     * Documentos encontrados para selección del usuario.
     */
    documents?: DocumentSearchResult[];
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
}
