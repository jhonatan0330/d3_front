export interface Task
{
    key: string;
    title: string;
    notes: string;
    completed: Date;
    dueDate: Date;
    priority: 0 | 1 | 2;
    order: number;
}
