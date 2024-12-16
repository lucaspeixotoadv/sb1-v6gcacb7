import { useState, useCallback } from 'react';
import { isValidPhone, isValidEmail, isValidDate } from '../../../../utils/validators';
import type { FormData, FormErrors } from '../types';

export function useContactForm(initialData: FormData) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    // Validação do nome
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Primeiro nome é obrigatório';
    }

    // Validação do telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Formato inválido. Use: (11) 99999-9999';
    }

    // Validação do email (opcional)
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação da data de nascimento (opcional)
    if (formData.birthDate && !isValidDate(formData.birthDate)) {
      newErrors.birthDate = 'Data inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa o erro do campo quando ele é alterado
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    validateForm,
    handleChange,
    resetForm
  };
}