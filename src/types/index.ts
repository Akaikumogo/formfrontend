export type UserRole = 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'DATE'
  | 'DATETIME'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'YES_NO'
  | 'RATING';

export interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  department?: string | null;
  onboardingCompleted?: boolean;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  teacherId?: string;
  _count?: { students: number; assignments: number };
  students?: StudentProfile[];
  stats?: {
    students: number;
    activeForms: number;
    completedResponses: number;
  };
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber?: string | null;
  phone?: string | null;
  groupId?: string | null;
  group?: Group | null;
  address?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  teacherProfile?: TeacherProfile | null;
  studentProfile?: StudentProfile | null;
  profile?: TeacherProfile | StudentProfile | null;
}

export interface FormField {
  id: string;
  formId: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  placeholder?: string | null;
  description?: string | null;
  config?: Record<string, unknown>;
  defaultValue?: string | null;
  order: number;
}

export interface FormItem {
  id: string;
  publicId: string;
  title: string;
  description?: string | null;
  status: FormStatus;
  createdById: string;
  startsAt?: string | null;
  endsAt?: string | null;
  allowMultipleResponses?: boolean;
  allowEditAfterSubmit?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User & { teacherProfile?: TeacherProfile | null };
  fields?: FormField[];
  assignments?: FormAssignment[];
  _count?: { fields: number; responses: number; assignments: number };
  submitted?: boolean;
  myResponse?: { id: string; submittedAt: string } | null;
}

export interface FormAssignment {
  id: string;
  formId: string;
  studentId?: string | null;
  groupId?: string | null;
  student?: StudentProfile | null;
  group?: Group | null;
  assignedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  SHORT_TEXT: 'Qisqa matn',
  LONG_TEXT: 'Uzun matn',
  NUMBER: 'Raqam',
  EMAIL: 'Email',
  PHONE: 'Telefon',
  DATE: 'Sana',
  DATETIME: 'Sana va vaqt',
  SINGLE_SELECT: 'Bitta tanlov',
  MULTI_SELECT: "Ko'p tanlov",
  YES_NO: 'Ha / Yo‘q',
  RATING: 'Baholash',
};

export const STATUS_COLORS: Record<FormStatus, string> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  CLOSED: 'warning',
  ARCHIVED: 'default',
};
