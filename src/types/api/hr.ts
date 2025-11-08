// HR Types - Sincronizados con backend Spring Boot

// Enums según documentación backend
export type EmployeeStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'TERMINATED'
  | 'ON_LEAVE';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ON_LEAVE';

export type PayrollStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'APPROVED'
  | 'PAID'
  | 'CANCELLED';

export type PayrollItemType =
  | 'BASE_SALARY'
  | 'BONUS'
  | 'OVERTIME'
  | 'ALLOWANCE'
  | 'TAX'
  | 'INSURANCE'
  | 'DEDUCTION'
  | 'OTHER';

// Payroll Item Response según backend
export interface PayrollItemResponse {
  id: string; // UUID
  type: PayrollItemType;
  description: string;
  amount: number; // Positivo para ingresos, negativo para deducciones
}

// Employee Response según backend
export interface EmployeeResponse {
  id: string; // UUID
  userId: string; // UUID
  userName: string;
  userEmail: string;
  employeeNumber: string;
  department?: string;
  position?: string;
  hireDate: string; // ISO 8601 date
  salary?: number;
  status: EmployeeStatus;
  managerId?: string; // UUID
  managerName?: string;
}

export interface CreateEmployeeRequest {
  userId: string;
  employeeNumber: string;
  department?: string;
  position?: string;
  hireDate: string;
  salary?: number;
  status?: EmployeeStatus; // Default: 'ACTIVE'
  managerId?: string;
}

export interface UpdateEmployeeRequest {
  employeeNumber?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
  status?: EmployeeStatus;
  managerId?: string;
}

// Attendance Response según backend
export interface AttendanceResponse {
  id: string; // UUID
  employeeId: string; // UUID
  employeeName: string;
  employeeNumber: string;
  date: string; // ISO 8601 date
  checkIn?: string; // ISO 8601 datetime
  checkOut?: string; // ISO 8601 datetime
  hoursWorked?: number;
  status: AttendanceStatus;
}

export interface CreateAttendanceRequest {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
}

export interface UpdateAttendanceRequest {
  date?: string;
  checkIn?: string;
  checkOut?: string;
  status?: AttendanceStatus;
}

// Payroll Response según backend
export interface PayrollResponse {
  id: string; // UUID
  employeeId: string; // UUID
  employeeName: string;
  employeeNumber: string;
  periodStart: string; // ISO 8601 date
  periodEnd: string; // ISO 8601 date
  baseSalary: number;
  netSalary: number; // Calculado automáticamente
  status: PayrollStatus;
  items: PayrollItemResponse[];
}

export interface CreatePayrollRequest {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  items: {
    type: PayrollItemType;
    description: string;
    amount: number;
  }[];
}

export interface UpdatePayrollRequest {
  periodStart?: string;
  periodEnd?: string;
  baseSalary?: number;
  status?: PayrollStatus;
  items?: {
    type: PayrollItemType;
    description: string;
    amount: number;
  }[];
}
