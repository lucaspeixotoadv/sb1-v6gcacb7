export interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
  birthDate: string;
}

export interface FormErrors {
  firstName?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
}

export const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  notes: '',
  birthDate: '',
};