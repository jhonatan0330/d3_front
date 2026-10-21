export interface IdDialogData {
    id?: string;
}

export interface TemplateChildDialogData extends IdDialogData {
    templateId: string;
}

export interface ProcessChildDialogData extends IdDialogData {
    processId: string;
}

export interface RelationDialogData extends IdDialogData {
    propiedadId: string;
}
