export interface ReportCreationStatus {
    planoNome: string;
    planoId: number;
    totalRelatoriosIAMes: number;
    limiteRelatoriosIAMes: number;
    podeExcederRelatorios: boolean;
    criacaoGeraraCobranca: boolean;
}