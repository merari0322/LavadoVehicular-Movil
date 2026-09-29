// Validaciones y datos del formulario de perfil (equivalente a los validators de Angular)

export interface PhoneCountry {
  code: string;
  dialCode: string;
  flag: string; // Emoji de bandera (en móvil no usamos la librería flag-icons)
  regex: RegExp;
  digits: number;
}

export interface ProfileFormValues {
  name: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  address: string;
}

// Cada error es una key de traducción, o undefined si el campo es válido
export type ProfileErrors = Partial<Record<keyof ProfileFormValues, string>>;

// Países disponibles en el selector del teléfono
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'CO', dialCode: '+57', flag: '🇨🇴', regex: /^3\d{9}$/, digits: 10 },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', regex: /^[2-9]\d{9}$/, digits: 10 },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', regex: /^[67]\d{8}$/, digits: 9 },
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', regex: /^9\d{9,10}$/, digits: 11 },
];

const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deja solo los dígitos y toma los últimos 10 (quita indicativos como +57)
export const cleanPhoneNumber = (phone: string): string =>
  phone.replace(/\D/g, '').slice(-10);

// Busca un país por su código, con Colombia como valor por defecto
export const getCountryByCode = (code: string): PhoneCountry =>
  PHONE_COUNTRIES.find((country) => country.code === code) ?? PHONE_COUNTRIES[0];

const validateName = (value: string): string | undefined => {
  if (!value.trim()) return 'profile.validation.nameRequired';
  if (value.length < 3) return 'profile.validation.nameMin';
  if (!NAME_PATTERN.test(value)) return 'profile.validation.nameInvalid';
  return undefined;
};

const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) return 'profile.validation.emailRequired';
  if (!EMAIL_PATTERN.test(value)) return 'profile.validation.emailInvalid';
  return undefined;
};

const validatePhone = (number: string, countryCode: string): string | undefined => {
  if (!number) return 'profile.validation.phoneRequired';
  if (!getCountryByCode(countryCode).regex.test(number)) {
    return 'profile.validation.phoneInvalid';
  }
  return undefined;
};

const validateAddress = (value: string): string | undefined => {
  if (!value.trim()) return 'profile.validation.addressRequired';
  if (value.length < 5) return 'profile.validation.addressMin';
  return undefined;
};

// Valida todo el formulario y devuelve los errores por campo
export const validateProfile = (values: ProfileFormValues): ProfileErrors => ({
  name: validateName(values.name),
  email: validateEmail(values.email),
  phoneNumber: validatePhone(values.phoneNumber, values.phoneCountry),
  address: validateAddress(values.address),
});

// Indica si hay al menos un error en el formulario
export const hasProfileErrors = (errors: ProfileErrors): boolean =>
  Object.values(errors).some(Boolean);
