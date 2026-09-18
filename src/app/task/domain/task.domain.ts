/**
 * Tipos del dominio tasks — espejo de contract.md §7
 *
 * TaskDTO: { user, title, notes, completed, dueDate, priority, order, createdAt }
 * TaskRequest: { key, user, title, notes, completed, dueDate, priority, order }
 */

export interface TaskDTO {
    user: string;
    title: string;
    notes: string;
    completed: string | null;
    dueDate: string | null;
    priority: number;
    order: number;
    createdAt: string;
}

export interface TaskRequest {
    key: string | null;
    user: string;
    title: string;
    notes: string;
    completed: string | null;
    dueDate: string | null;
    priority: number;
    order: number;
}

/** Tipo extendido para UI — incluye campos de respuesta del backend no documentados en contract */
export interface Task extends TaskDTO {
    key: string;
}
