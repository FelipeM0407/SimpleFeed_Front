export interface FormCreationStatus {
    planoNome: string;
    planoId: number;
    totalFormulariosAtivos: number;
    limiteFormularios: number;
    podeExcederFormulario: boolean;
    criacaoGeraraCobranca: boolean;
}