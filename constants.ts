import { Volunteer, AppSettings, ScheduleMap } from './types';

export const ADMIN_CREDENTIALS = {
  email: 'admin@diaconia.com',
  password: 'Diaconia2025@ipg2'
};

export const INITIAL_SETTINGS: AppSettings = {
  appTitle: 'Junta Diaconal IPGII',
  deaconSectionTitle: 'Diáconos',
  dashboardInfo: 'A escala está sujeita a alterações. Por favor, comunique qualquer troca com antecedência.'
};

// Initial dummy data if localStorage is empty
export const INITIAL_VOLUNTEERS: Volunteer[] = [
  { id: '1', name: 'João Silva', phone: '11999999999' },
  { id: '2', name: 'Maria Oliveira', phone: '11988888888' },
  { id: '3', name: 'Pedro Santos', phone: '11977777777' },
  { id: '4', name: 'Ana Souza', phone: '11966666666' },
  { id: '5', name: 'Lucas Lima', phone: '11955555555' },
];

export const INITIAL_SCHEDULE: ScheduleMap = {};