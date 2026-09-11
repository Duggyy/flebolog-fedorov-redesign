export type DoctorUser = {
  id: string;
  name: string;
  birthDate: string;
  speciality: string;
  organization: string;
  address: string;
  phone: string;
  email: string;
  login: string;
  password: string;
};

export const doctorsStorageKey = "fedorov-doctor-users-v1";

export const initialDoctors: DoctorUser[] = [
  {
    id: "fedorov",
    name: "Федоров А. И.",
    birthDate: "",
    speciality: "Врач-флеболог",
    organization: "Ниармедик",
    address: "Москва",
    phone: "",
    email: "",
    login: "fedorov",
    password: "1234",
  },
  {
    id: "uzist",
    name: "Иванова М. С.",
    birthDate: "",
    speciality: "Врач УЗИ",
    organization: "Ниармедик",
    address: "Москва",
    phone: "",
    email: "",
    login: "ivanova",
    password: "1234",
  },
];

export const loadDoctorUsers = () => {
  const saved = localStorage.getItem(doctorsStorageKey);
  if (!saved) return initialDoctors;

  try {
    const parsed = JSON.parse(saved) as DoctorUser[];
    return parsed.map((doctor) => ({ ...emptyDoctorUser(), ...doctor }));
  } catch {
    return initialDoctors;
  }
};

export const saveDoctorUsers = (doctors: DoctorUser[]) => {
  localStorage.setItem(doctorsStorageKey, JSON.stringify(doctors));
};

export const emptyDoctorUser = (): DoctorUser => ({
  id: crypto.randomUUID(),
  name: "",
  birthDate: "",
  speciality: "",
  organization: "",
  address: "",
  phone: "",
  email: "",
  login: "",
  password: "",
});
