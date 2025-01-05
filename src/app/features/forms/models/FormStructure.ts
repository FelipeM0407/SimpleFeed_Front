export interface FormStructure {
    Name: string;
    Client_Id: number;
    Is_Active: boolean;
    TemplateId: number;
    Fields: FormField[];
}

export interface FormField {
    Id: number;
    Type: string;
    Required: boolean;
    Label: string;
    Name: string;
    Ordenation: number;
    Options?: string;
    Field_Type_Id: number;
}
 