export interface Volunteer {
  id: string;
  name: string;
  phone: string;
}

export type ServiceTime = '09:00' | '18:00';

export interface Shift {
  slotId: 1 | 2 | 3;
  volunteerId: string | null; // null means "Available"
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  services: {
    [key in ServiceTime]: Shift[];
  };
}

export interface ScheduleMap {
  [date: string]: DaySchedule;
}

export interface AppSettings {
  appTitle: string;
  deaconSectionTitle: string;
  dashboardInfo: string;
}

export interface UserSession {
  isAdmin: boolean;
}