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

