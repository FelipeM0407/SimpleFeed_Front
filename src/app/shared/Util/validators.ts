import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Valida se o CPF é válido.
 */
export function cpfValidator(control: AbstractControl): ValidationErrors | null {
    const cpf = control.value?.replace(/\D/g, ''); // Remove não numéricos

    if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return { cpfInvalido: true };
    }

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return { cpfInvalido: true };

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return { cpfInvalido: true };

    return null; // CPF válido
}


/**
 * Valida se o CNPJ é válido.
 */
export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
    const cnpj = control.value?.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Verifica se o CNPJ está vazio, tem tamanho diferente de 14 ou se todos os dígitos são iguais
    if (!cnpj || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
        return { cnpjInvalido: true };
    }

    // Validação do primeiro dígito verificador
    let tamanho = 12;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let peso = tamanho - 7; // Inicia com 5 (para 12 dígitos: 12 - 7 = 5)

    for (let i = 0; i < tamanho; i++) {
        soma += parseInt(numeros.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
        return { cnpjInvalido: true };
    }

    // Validação do segundo dígito verificador
    tamanho = 13;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    peso = tamanho - 7; // Inicia com 6 (para 13 dígitos: 13 - 7 = 6)

    for (let i = 0; i < tamanho; i++) {
        soma += parseInt(numeros.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(cnpj.charAt(13))) {
        return { cnpjInvalido: true };
    }

    return null; // CNPJ válido
}

/**
 * Valida um número de celular.
 */
export function telefoneValidator(control: AbstractControl): ValidationErrors | null {
    const telefone = control.value?.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Verifica se o telefone está vazio ou tem um comprimento diferente de 11
    if (!telefone || telefone.length !== 11) {
        return { telefoneInvalido: true };
    }

    // Verifica se o telefone é composto por números repetidos (ex: 11111111111, 22222222222, etc.)
    if (/^(\d)\1+$/.test(telefone)) {
        return { telefoneInvalido: true };
    }

    // Adicionar validações extras se necessário
    // Exemplo: verificar se o DDD (os dois primeiros dígitos) é válido
    const ddd = telefone.substring(0, 2);
    const dddsInvalidos = ['00']; // Exemplo: DDD inválido (pode adicionar mais)
    if (dddsInvalidos.includes(ddd)) {
        return { telefoneInvalido: true };
    }

    return null; // Telefone válido
}

