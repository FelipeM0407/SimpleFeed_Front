export interface FormField {
    id: number;
    type: string;
    required: boolean;
    label: string;
    name: string;
    ordenation: number;
    options?: string[];
    field_Type_Id: number;
}
 