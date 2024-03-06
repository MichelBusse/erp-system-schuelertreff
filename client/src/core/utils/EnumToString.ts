import ContractState from "../enums/ContractState"
import ContractType from "../enums/ContractType"
import LeaveState from "../enums/LeaveState"
import LeaveType from "../enums/LeaveType"
import SchoolState from "../enums/SchoolState"
import TeacherDegree from "../enums/TeacherDegree"
import TeacherSchoolType from "../enums/TeacherSchoolType"
import TeacherState from "../enums/TeacherState"

export const teacherStateToString: { [key in TeacherState]: string } = {
  created: 'Registriert',
  interview: 'Beworben',
  applied: 'BG gehalten',
  contract: 'Angenommen',
  employed: 'Eingestellt',
}

export const schoolStateToString: { [key in SchoolState]: string } = {
  created: 'Registriert',
  confirmed: 'Bestätigt',
}

export const leaveTypeToString: { [key in LeaveType]: string } = {
  regular: 'Urlaub',
  sick: 'Krankmeldung',
}

export const leaveStateToString: { [key in LeaveState]: string } = {
  pending: 'ausstehend',
  accepted: 'bestätigt',
  declined: 'abgelehnt',
}

export const leaveStateToHeadlineString: { [key in LeaveState]: string } = {
  pending: 'Ausstehende Urlaube/Krankmeldungen',
  accepted: 'Bestätigte Urlaube/Krankmeldungen',
  declined: 'Abgelehnte Urlaube/Krankmeldungen',
}

export const contractStateToString: { [key in ContractState]: string } = {
  pending: 'ausstehend',
  accepted: 'bestätigt',
  declined: 'abgelehnt',
}

export const contractTypeToString: { [key in ContractType]: string } = {
  online: 'Online',
  standard: 'Präsenz',
}

export const teacherSchoolTypeToString: { [key in TeacherSchoolType]: string } =
  {
    grundschule: 'Grundschule',
    oberschule: 'Oberschule',
    sek1: 'Gymnasium Sek. 1',
    sek2: 'Gymnasium Sek. 2',
  }

export const teacherDegreeToString: { [key in TeacherDegree]: string } = {
  noinfo: 'Keine Angabe',
  highschool: 'Abitur',
  bachelor: 'Bachelor',
  master: 'Master',
}