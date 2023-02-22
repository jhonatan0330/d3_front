export interface Task
{
    llaveTabla: string;
    title: string;
    notes: string;
    completed: boolean;
    dueDate: Date;
    priority: 0 | 1 | 2;
    order: number;
}
