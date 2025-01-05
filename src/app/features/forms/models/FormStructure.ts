export interface FormStructure {
    name: string;
    clientId: number;
    isActive: boolean;
    templateId: number;
    fields: FormField[];
}

export interface FormField {
    id: number;
    type: string;
    required: boolean;
    label: string;
    name: string;
    ordenation: number;
    options?: string;
    fieldTypeId: number;
}
