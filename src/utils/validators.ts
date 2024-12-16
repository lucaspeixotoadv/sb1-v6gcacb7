export function isValidPhone(phone: string): boolean {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  if (numbers.length !== 10 && numbers.length !== 11) {
    return false;
  }

  // Verifica se o DDD é válido (11-99)
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  // Para celular (11 dígitos), verifica se começa com 9
  if (numbers.length === 11 && numbers[2] !== '9') {
    return false;
  }

  return true;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function parseDate(dateString: string): Date | null {
  if (!isValidDate(dateString)) return null;
  return new Date(dateString);
}