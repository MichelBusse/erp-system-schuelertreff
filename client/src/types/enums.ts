export enum TeacherState {
  CREATED = 'created',
  INTERVIEW = 'interview',
  APPLIED = 'applied',
  CONTRACT = 'contract',
  EMPLOYED = 'employed',
}

export enum Degree {
  NOINFO = 'noinfo',
  HIGHSCHOOL = 'highschool',
  BACHELOR = 'bachelor',
  MASTER = 'master',
}

export enum DeleteState {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export enum SchoolType {
  GRUNDSCHULE = 'grundschule',
  OBERSCHULE = 'oberschule',
  GYMNASIUM = 'gymnasium',
  ANDERE = 'other',
}

export enum TeacherSchoolType {
  GRUNDSCHULE = 'grundschule',
  OBERSCHULE = 'oberschule',
  GYMSEK1 = 'sek1',
  GYMSEK2 = 'sek2',
}

export enum LeaveType {
  REGULAR = 'regular',
  SICK = 'sick',
}

export enum LeaveState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum ContractType {
  STANDARD = 'standard',
  ONLINE = 'online',
}
