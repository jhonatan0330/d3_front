export interface TaskDTO {
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
    title: string;
    notes: string;
    completed: string | null;
    dueDate: string | null;
    priority: number;
    order: number;
}

export interface Task extends TaskDTO {
    key: string;
}
