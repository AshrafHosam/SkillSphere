export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface CreateTeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  specialization?: string;
}

export interface CreateStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  studentNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface TeacherProfileDto {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  employeeId?: string;
  specialization?: string;
  isSupervisor: boolean;
  isActive: boolean;
}

export interface StudentProfileDto {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  studentNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
}

export interface ParentProfileDto {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  relationship?: string;
  students: StudentProfileDto[];
}

export interface LinkParentRequest {
  parentUserId: string;
  studentUserId: string;
  isPrimary: boolean;
}
