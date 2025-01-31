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
    const telefone = control.value?.replace(/\D/g, ''); // Remove não numéricos

    if (!telefone || telefone.length !== 11 || /^(\d)\1+$/.test(telefone)) {
        return { telefoneInvalido: true };
    }

    return null; // Telefone válido
}
