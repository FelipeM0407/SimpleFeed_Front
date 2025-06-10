export interface InvoiceDto {
    clientId: number;
    planId: number;
    referenceMonth: string;
    totalFormsMes: number;
    formsDentroPlano: number;
    formsExcedentes: number;
    totalRespostasArmazenadas: number;
    respostasDentroPlano: number;
    respostasExcedentes: number;
    totalAiReports: number;
    aiReportsLimite: number;
    extraAiReports: number;
    formExcessCharge: number;
    responseExcessCharge: number;
    aiReportExcessCharge: number;
    valorFaturaAteAgora: number;
    valorBaseFatura: number;
    nomePlano: string;
}