import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Plus,
  Printer,
  Save,
  Search,
  Settings,
  Stethoscope,
  Trash2,
  X,
  UserRound,
} from "lucide-react";
import ClinicBaseHeader from "@/components/ClinicBaseHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { loadAuthSession, saveAuthSession } from "@/lib/auth-session";
import {
  apiDeleteDictionaryEntry,
  apiGetDictionaries,
  apiGetDoctors,
  apiGetRecords,
  apiGetSession,
  apiImportDictionaryEntries,
  apiLogin,
  apiSaveDictionaryEntry,
  apiSaveRecords,
  isApiUnavailable,
} from "@/lib/clinicbase-api";
import { DoctorUser, initialDoctors, loadDoctorUsers } from "@/lib/doctor-users";

type Patient = {
  id: string;
  doctorId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  phone: string;
  address: string;
};

type Visit = {
  id: string;
  patientId: string;
  doctorId: string;
  recordDate: string;
  /**
   * Время приёма в формате ЧЧ:ММ. В прототипе график показывает «Дата · Время ·
   * Доктор · Протокол», и без времени две записи одного дня не различить.
   * У старых записей поля нет — читаем как пустую строку.
   */
  recordTime: string;
  ageAtVisit: string;
  doctorName: string;
  consultationType: string;
  complaints: string;
  diseaseHistory: string;
  heredity: string;
  pastDiseases: string;
  pastOperations: string;
  allergies: string;
  generalExam: string;
  localExam: string;
  ultrasoundDoctor: string;
  ultrasoundConsultationType: string;
  ultrasoundDevice: string;
  deepVeinsRight: string;
  deepVeinsLeft: string;
  surfaceVeinsRightGsv: string;
  surfaceVeinsRightSsv: string;
  surfaceVeinsLeftGsv: string;
  surfaceVeinsLeftSsv: string;
  perforators: string;
  edema: string;
  ultrasoundConclusion: string;
  diagnosisMain: string;
  diagnosisCode: string;
  diagnosisComorbidities: string;
  regimen: string;
  medicationTherapy: string;
  nonMedicationTherapy: string;
  specialistConsultations: string;
  examinationPlan: string;
  recommendations: string;
  manipulationName: string;
  manipulationDone: string;
  manipulationResult: string;
  nextVisitDate: string;
  doctorComment: string;
};

type MedicalRecords = {
  patients: Patient[];
  visits: Visit[];
};

type PrintField = {
  key: string;
  label: string;
  source: "patient" | "visit";
  field: keyof Patient | keyof Visit;
};

type PrintTemplate = {
  id: string;
  name: string;
  intro: string;
  fieldKeys: string[];
  outro: string;
};

type SaveFilePickerHandle = {
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type SaveFilePickerOptions = {
  id?: string;
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
};

type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>;
};

const consultationTypes = [
  "Первичная консультация флеболога",
  "Консультация флеболога",
  "УЗИ вен нижних конечностей",
  "Манипуляция",
  "Послеоперационный осмотр",
];

const storageKey = "fedorov-medical-records-v1";
const printTemplatesStorageKey = "clinicbase-print-templates-v1";
const primaryConsultationType = "Первичная консультация флеболога";
const followUpConsultationType = "Консультация флеболога";

const printFields: PrintField[] = [
  { key: "patient.fullName", label: "Пациент: ФИО", source: "patient", field: "lastName" },
  { key: "patient.birthDate", label: "Пациент: дата рождения", source: "patient", field: "birthDate" },
  { key: "patient.phone", label: "Пациент: телефон", source: "patient", field: "phone" },
  { key: "patient.address", label: "Пациент: адрес", source: "patient", field: "address" },
  { key: "visit.recordDate", label: "Дата приема", source: "visit", field: "recordDate" },
  { key: "visit.ageAtVisit", label: "Полных лет", source: "visit", field: "ageAtVisit" },
  { key: "visit.doctorName", label: "Врач", source: "visit", field: "doctorName" },
  { key: "visit.consultationType", label: "Тип консультации", source: "visit", field: "consultationType" },
  { key: "visit.complaints", label: "Жалобы", source: "visit", field: "complaints" },
  { key: "visit.diseaseHistory", label: "Анамнез заболевания", source: "visit", field: "diseaseHistory" },
  { key: "visit.heredity", label: "Наследственность", source: "visit", field: "heredity" },
  { key: "visit.pastDiseases", label: "Перенесенные заболевания", source: "visit", field: "pastDiseases" },
  { key: "visit.pastOperations", label: "Перенесенные операции", source: "visit", field: "pastOperations" },
  { key: "visit.allergies", label: "Аллергии", source: "visit", field: "allergies" },
  { key: "visit.generalExam", label: "Общий осмотр", source: "visit", field: "generalExam" },
  { key: "visit.localExam", label: "Локальный осмотр", source: "visit", field: "localExam" },
  { key: "visit.ultrasoundDoctor", label: "УЗИ: врач", source: "visit", field: "ultrasoundDoctor" },
  { key: "visit.ultrasoundDevice", label: "УЗИ: аппарат", source: "visit", field: "ultrasoundDevice" },
  { key: "visit.deepVeinsRight", label: "Глубокие вены справа", source: "visit", field: "deepVeinsRight" },
  { key: "visit.deepVeinsLeft", label: "Глубокие вены слева", source: "visit", field: "deepVeinsLeft" },
  { key: "visit.surfaceVeinsRightGsv", label: "Справа: бассейн БПВ", source: "visit", field: "surfaceVeinsRightGsv" },
  { key: "visit.surfaceVeinsRightSsv", label: "Справа: бассейн МПВ", source: "visit", field: "surfaceVeinsRightSsv" },
  { key: "visit.surfaceVeinsLeftGsv", label: "Слева: бассейн БПВ", source: "visit", field: "surfaceVeinsLeftGsv" },
  { key: "visit.surfaceVeinsLeftSsv", label: "Слева: бассейн МПВ", source: "visit", field: "surfaceVeinsLeftSsv" },
  { key: "visit.perforators", label: "Несостоятельные перфоранты", source: "visit", field: "perforators" },
  { key: "visit.edema", label: "Отек/лимфостаз", source: "visit", field: "edema" },
  { key: "visit.ultrasoundConclusion", label: "УЗИ: заключение", source: "visit", field: "ultrasoundConclusion" },
  { key: "visit.diagnosisMain", label: "Основное заболевание", source: "visit", field: "diagnosisMain" },
  { key: "visit.diagnosisCode", label: "Код МКБ", source: "visit", field: "diagnosisCode" },
  { key: "visit.diagnosisComorbidities", label: "Сопутствующие заболевания", source: "visit", field: "diagnosisComorbidities" },
  { key: "visit.regimen", label: "Режим", source: "visit", field: "regimen" },
  { key: "visit.medicationTherapy", label: "Медикаментозная терапия", source: "visit", field: "medicationTherapy" },
  { key: "visit.nonMedicationTherapy", label: "Немедикаментозная терапия", source: "visit", field: "nonMedicationTherapy" },
  { key: "visit.specialistConsultations", label: "Консультации специалистов", source: "visit", field: "specialistConsultations" },
  { key: "visit.examinationPlan", label: "План обследования", source: "visit", field: "examinationPlan" },
  { key: "visit.recommendations", label: "Рекомендации", source: "visit", field: "recommendations" },
  { key: "visit.nextVisitDate", label: "Дата следующего визита", source: "visit", field: "nextVisitDate" },
  { key: "visit.manipulationName", label: "Манипуляция: название и локализация", source: "visit", field: "manipulationName" },
  { key: "visit.manipulationDone", label: "Манипуляция: выполнено", source: "visit", field: "manipulationDone" },
  { key: "visit.manipulationResult", label: "Манипуляция: результат", source: "visit", field: "manipulationResult" },
  { key: "visit.doctorComment", label: "Комментарии доктора", source: "visit", field: "doctorComment" },
];

const defaultPrintTemplates: PrintTemplate[] = [
  {
    id: "short-consultation",
    name: "Осмотр и назначения краткий",
    intro: "Медицинская запись приема",
    fieldKeys: [
      "patient.fullName",
      "patient.birthDate",
      "visit.recordDate",
      "visit.doctorName",
      "visit.complaints",
      "visit.generalExam",
      "visit.localExam",
      "visit.diagnosisMain",
      "visit.diagnosisCode",
      "visit.medicationTherapy",
      "visit.nonMedicationTherapy",
      "visit.recommendations",
      "visit.nextVisitDate",
    ],
    outro: "",
  },
  {
    id: "full-consultation",
    name: "Осмотр и назначения полный",
    intro: "Полный протокол консультации",
    fieldKeys: [
      "patient.fullName",
      "patient.birthDate",
      "patient.phone",
      "patient.address",
      "visit.recordDate",
      "visit.ageAtVisit",
      "visit.doctorName",
      "visit.consultationType",
      "visit.complaints",
      "visit.diseaseHistory",
      "visit.heredity",
      "visit.pastDiseases",
      "visit.pastOperations",
      "visit.allergies",
      "visit.generalExam",
      "visit.localExam",
      "visit.diagnosisMain",
      "visit.diagnosisCode",
      "visit.diagnosisComorbidities",
      "visit.regimen",
      "visit.medicationTherapy",
      "visit.nonMedicationTherapy",
      "visit.specialistConsultations",
      "visit.examinationPlan",
      "visit.recommendations",
      "visit.nextVisitDate",
    ],
    outro: "",
  },
  {
    id: "ultrasound",
    name: "УЗИ",
    intro: "Протокол ультразвукового исследования вен нижних конечностей",
    fieldKeys: [
      "patient.fullName",
      "patient.birthDate",
      "visit.recordDate",
      "visit.ultrasoundDoctor",
      "visit.ultrasoundDevice",
      "visit.deepVeinsRight",
      "visit.deepVeinsLeft",
      "visit.surfaceVeinsRightGsv",
      "visit.surfaceVeinsRightSsv",
      "visit.surfaceVeinsLeftGsv",
      "visit.surfaceVeinsLeftSsv",
      "visit.perforators",
      "visit.edema",
      "visit.ultrasoundConclusion",
    ],
    outro: "",
  },
  {
    id: "manipulation",
    name: "Протокол манипуляции",
    intro: "Протокол выполненной манипуляции",
    fieldKeys: [
      "patient.fullName",
      "patient.birthDate",
      "visit.recordDate",
      "visit.doctorName",
      "visit.manipulationName",
      "visit.manipulationDone",
      "visit.manipulationResult",
      "visit.recommendations",
    ],
    outro: "",
  },
];

/** Текущее время в ЧЧ:ММ — для нового приёма. toTimeString даёт «ЧЧ:ММ:СС …». */
const currentTime = () => new Date().toTimeString().slice(0, 5);

const emptyVisit = (doctor: DoctorUser, patientId: string): Visit => ({
  id: crypto.randomUUID(),
  patientId,
  doctorId: doctor.id,
  recordDate: new Date().toISOString().slice(0, 10),
  recordTime: currentTime(),
  ageAtVisit: "",
  doctorName: doctor.name,
  consultationType: primaryConsultationType,
  complaints: "",
  diseaseHistory: "",
  heredity: "",
  pastDiseases: "",
  pastOperations: "",
  allergies: "",
  generalExam: "",
  localExam: "",
  ultrasoundDoctor: doctor.name,
  ultrasoundConsultationType: "УЗИ вен нижних конечностей",
  ultrasoundDevice: "",
  deepVeinsRight: "",
  deepVeinsLeft: "",
  surfaceVeinsRightGsv: "",
  surfaceVeinsRightSsv: "",
  surfaceVeinsLeftGsv: "",
  surfaceVeinsLeftSsv: "",
  perforators: "",
  edema: "",
  ultrasoundConclusion: "",
  diagnosisMain: "",
  diagnosisCode: "",
  diagnosisComorbidities: "",
  regimen: "",
  medicationTherapy: "",
  nonMedicationTherapy: "",
  specialistConsultations: "",
  examinationPlan: "",
  recommendations: "",
  manipulationName: "",
  manipulationDone: "",
  manipulationResult: "",
  nextVisitDate: "",
  doctorComment: "",
});

const initialPatients: Patient[] = [
  {
    id: "patient-1",
    doctorId: "fedorov",
    lastName: "Смирнова",
    firstName: "Елена",
    middleName: "Петровна",
    birthDate: "1978-04-18",
    phone: "+7 900 123-45-67",
    address: "Москва",
  },
  {
    id: "patient-2",
    doctorId: "fedorov",
    lastName: "Кузнецов",
    firstName: "Андрей",
    middleName: "Викторович",
    birthDate: "1965-11-03",
    phone: "+7 916 555-12-12",
    address: "Московская область",
  },
  {
    id: "patient-3",
    doctorId: "uzist",
    lastName: "Орлова",
    firstName: "Мария",
    middleName: "Игоревна",
    birthDate: "1984-02-09",
    phone: "+7 985 222-10-44",
    address: "Москва",
  },
];

const initialVisits: Visit[] = [
  {
    ...emptyVisit(initialDoctors[0], "patient-1"),
    id: "visit-1",
    recordDate: "2026-05-26",
    recordTime: "12:24",
    ageAtVisit: "48",
    complaints: "Тяжесть в ногах к вечеру, отечность голеней.",
    diseaseHistory: "Симптомы отмечает около 3 лет, усилились за последние месяцы.",
    heredity: "У матери варикозная болезнь.",
    allergies: "Отрицает.",
    generalExam: "Общее состояние удовлетворительное.",
    localExam: "Варикозно расширенные притоки по медиальной поверхности правой голени.",
    ultrasoundDevice: "Mindray DC-80",
    deepVeinsRight: "Проходимы, компрессия полная.",
    deepVeinsLeft: "Проходимы, компрессия полная.",
    surfaceVeinsRightGsv: "Рефлюкс по БПВ справа.",
    ultrasoundConclusion: "Эхопризнаки варикозной болезни правой нижней конечности.",
    diagnosisMain: "Варикозная болезнь нижних конечностей.",
    diagnosisCode: "I83.9",
    medicationTherapy: "Венотоник курсом 2 месяца.",
    nonMedicationTherapy: "Компрессионный трикотаж 2 класса.",
    recommendations: "Контрольный осмотр после дообследования.",
    nextVisitDate: "2026-06-10",
  },
  // Второй приём того же врача — чтобы в графике было что копировать.
  {
    ...emptyVisit(initialDoctors[0], "patient-1"),
    id: "visit-2",
    recordDate: "2026-06-10",
    recordTime: "09:32",
    ageAtVisit: "48",
    consultationType: "Консультация флеболога",
    complaints: "Тяжесть в ногах уменьшилась, отёк к вечеру сохраняется.",
    localExam: "Варикозно расширенные притоки без отрицательной динамики.",
    diagnosisMain: "Варикозная болезнь нижних конечностей.",
    diagnosisCode: "I83.9",
    recommendations: "Продолжить компрессионный режим.",
  },
  // Приём другого врача у того же пациента: в графике он показывается
  // розовым и не открывается — раскрыть его может только автор записи.
  {
    ...emptyVisit(initialDoctors[1], "patient-1"),
    id: "visit-3",
    recordDate: "2026-06-03",
    recordTime: "16:08",
    ageAtVisit: "48",
    consultationType: "УЗИ вен нижних конечностей",
    ultrasoundDevice: "Mindray DC-80",
    ultrasoundConclusion: "Эхопризнаки варикозной болезни правой нижней конечности.",
  },
];

const mergeVisitsByPatientAndDate = (visits: Visit[], preferredVisitId = "") => {
  const groupedVisits = new Map<string, Visit[]>();
  visits.forEach((visit) => {
    const key = `${visit.patientId}-${visit.recordDate}`;
    groupedVisits.set(key, [...(groupedVisits.get(key) ?? []), visit]);
  });

  const mergedVisits = Array.from(groupedVisits.values()).map((group) => {
    const preferredVisit = group.find((visit) => visit.id === preferredVisitId);
    // recordTime добавлен позже остальных полей: у записей, сохранённых до
    // этого, его нет. Подставляем пустую строку, чтобы тип не врал.
    const baseVisit = { recordTime: "", ...(preferredVisit ?? group[group.length - 1]) };

    group.forEach((visit) => {
      (Object.keys(baseVisit) as Array<keyof Visit>).forEach((field) => {
        if (!baseVisit[field] && visit[field]) {
          baseVisit[field] = visit[field] as never;
        }
      });
    });

    return baseVisit;
  });

  return mergedVisits;
};

const loadRecords = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return { patients: initialPatients, visits: mergeVisitsByPatientAndDate(initialVisits) };
  }

  try {
    const parsed = JSON.parse(saved) as { patients: Patient[]; visits: Visit[] };
    return { ...parsed, visits: mergeVisitsByPatientAndDate(parsed.visits) };
  } catch {
    return { patients: initialPatients, visits: mergeVisitsByPatientAndDate(initialVisits) };
  }
};

const loadPrintTemplates = () => {
  const saved = localStorage.getItem(printTemplatesStorageKey);
  if (!saved) return defaultPrintTemplates;

  try {
    const parsed = JSON.parse(saved) as PrintTemplate[];
    return parsed.length > 0 ? parsed : defaultPrintTemplates;
  } catch {
    return defaultPrintTemplates;
  }
};

const savePrintTemplates = (templates: PrintTemplate[]) => {
  localStorage.setItem(printTemplatesStorageKey, JSON.stringify(templates));
};

const getAgeAtDate = (birthDate: string, visitDate: string) => {
  if (!birthDate || !visitDate) return "";
  const birth = new Date(birthDate);
  const visit = new Date(visitDate);
  let age = visit.getFullYear() - birth.getFullYear();
  const monthDiff = visit.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && visit.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Number.isFinite(age) ? String(age) : "";
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getPatientFullName = (patient: Patient) =>
  `${patient.lastName} ${patient.firstName} ${patient.middleName}`.trim();

const getPrintFieldValue = (field: PrintField, patient: Patient, visit: Visit) => {
  if (field.key === "patient.fullName") {
    return getPatientFullName(patient);
  }

  const value = field.source === "patient" ? patient[field.field as keyof Patient] : visit[field.field as keyof Visit];
  return String(value ?? "");
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const getNearestNextVisitDate = (visits: Visit[], patientId: string) => {
  const today = todayIso();
  return (
    visits
      .filter((visit) => visit.patientId === patientId && visit.nextVisitDate >= today)
      .map((visit) => visit.nextVisitDate)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))[0] ?? ""
  );
};

const suggestionsStorageKey = "fedorov-field-suggestions-v1";
const dictionariesStorageKey = "clinicbase-dictionaries-v1";

const defaultSuggestions: Record<string, string[]> = {
  Жалобы: [
    "Тяжесть в ногах к вечеру",
    "Отечность голеней",
    "Боли по ходу варикозно расширенных вен",
    "Судороги в икроножных мышцах ночью",
  ],
  "Анамнез заболевания": [
    "Симптомы отмечает в течение нескольких лет",
    "Усиление симптомов за последние месяцы",
    "Ранее лечение не проводилось",
  ],
  "Наследственность по основному заболеванию": [
    "Наследственность отягощена",
    "У матери варикозная болезнь",
    "Наследственность не отягощена",
  ],
  "Перенесенные заболевания": ["ОРВИ", "Гипертоническая болезнь", "Сахарный диабет отрицает"],
  "Перенесенные операции": ["Операции отрицает", "Аппендэктомия", "Кесарево сечение"],
  Аллергии: ["Аллергические реакции отрицает", "Лекарственная аллергия отрицается"],
  "Общий осмотр": ["Общее состояние удовлетворительное", "Кожные покровы обычной окраски"],
  "Локальный осмотр": [
    "Варикозно расширенные притоки по медиальной поверхности голени",
    "Отеков на момент осмотра нет",
    "Кожные покровы без трофических изменений",
  ],
  "Глубокие вены правая нижняя конечность": ["Проходимы, компрессия полная", "Признаков тромбоза не выявлено"],
  "Глубокие вены левая нижняя конечность": ["Проходимы, компрессия полная", "Признаков тромбоза не выявлено"],
  "Правая нижняя конечность: бассейн БПВ": ["Рефлюкс по БПВ справа", "БПВ проходима, клапаны состоятельны"],
  "Правая нижняя конечность: бассейн МПВ": ["МПВ проходима, клапаны состоятельны", "Рефлюкс по МПВ справа"],
  "Левая нижняя конечность: бассейн БПВ": ["Рефлюкс по БПВ слева", "БПВ проходима, клапаны состоятельны"],
  "Левая нижняя конечность: бассейн МПВ": ["МПВ проходима, клапаны состоятельны", "Рефлюкс по МПВ слева"],
  "Несостоятельные перфоранты": ["Не выявлены", "Выявлены на голени"],
  "Отек/лимфостаз": ["Отек не определяется", "Пастозность голеней"],
  Заключение: ["Эхопризнаки варикозной болезни нижних конечностей", "Данных за тромбоз глубоких вен не получено"],
  "Основное заболевание": ["Варикозная болезнь нижних конечностей", "Хроническая венозная недостаточность"],
  "Медикаментозная терапия": ["Венотоник курсом 2 месяца", "НПВС местно при болевом синдроме"],
  "Немедикаментозная терапия, рекомендованные манипуляции": [
    "Компрессионный трикотаж 2 класса",
    "Рекомендовано ЭВЛК",
    "Рекомендована склеротерапия",
  ],
  "План обследования": ["УЗДС вен нижних конечностей", "Контрольный осмотр после дообследования"],
  Рекомендации: ["Динамическое наблюдение", "Контрольный осмотр через 1 месяц"],
  "Комментарии доктора": ["Не выводить на печать", "Обсужден план лечения"],
};

/** «Общие» видит каждый врач, «Мои» — только автор. */
type DictionaryScope = "global" | "personal";

/**
 * Запись справочника.
 *
 * Раньше подсказки были просто массивом строк на поле. Из такого массива
 * нельзя получить ни краткое имя отдельно от полного текста, ни цвет шрифта,
 * ни подпункт, ни порядок, заданный врачом, — поэтому запись стала объектом,
 * а массив остался только представлением для панели.
 */
type DictionaryEntry = {
  id: string;
  /** Имя поля, к которому привязан раздел: «Жалобы», «Аллергии» и т. д. */
  section: string;
  /** Краткое имя — то, что вставляется в текст протокола. */
  short: string;
  /** Полный текст — раскрывается в подсказке и идёт в печатную форму. */
  full: string;
  /** Цвет шрифта в подсказке, `#rrggbb`. Пустая строка — цвет по умолчанию. */
  color: string;
  /** Родительская запись: подпункт дописывает текст к вставленному. */
  parentId: string;
  order: number;
  scope: DictionaryScope;
};

/** Палитра для редактора: цвета подобраны так, чтобы читаться на светлом фоне. */
const dictionaryColors = [
  { value: "", label: "По умолчанию" },
  { value: "#b91c1c", label: "Красный" },
  { value: "#c2410c", label: "Оранжевый" },
  { value: "#a16207", label: "Жёлто-коричневый" },
  { value: "#15803d", label: "Зелёный" },
  { value: "#0f766e", label: "Бирюзовый" },
  { value: "#1d4ed8", label: "Синий" },
  { value: "#6d28d9", label: "Фиолетовый" },
  { value: "#be185d", label: "Розовый" },
  { value: "#334155", label: "Тёмно-серый" },
];

/**
 * Устойчивый идентификатор из текста.
 *
 * Нужен для записей, которые создаются из справочника по умолчанию: при
 * каждом запуске они должны получать те же id, иначе первое же сохранение
 * в базу превратилось бы в поток дублей. Порядок ключей в объекте для этого
 * не годится — он может измениться при правке файла.
 */
const stableId = (prefix: string, ...parts: string[]) => {
  let hash = 5381;
  const source = parts.join("\u0000");
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) + hash + source.charCodeAt(index)) | 0;
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
};

const isDictionaryEntry = (value: unknown): value is DictionaryEntry => {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<DictionaryEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.section === "string" &&
    typeof entry.short === "string" &&
    (entry.scope === "global" || entry.scope === "personal")
  );
};

/** Приведение к полному виду: у записей из старых версий части полей нет. */
const normalizeEntry = (entry: DictionaryEntry): DictionaryEntry => ({
  id: entry.id,
  section: entry.section,
  short: entry.short,
  full: typeof entry.full === "string" ? entry.full : "",
  color: /^#[0-9a-fA-F]{6}$/.test(entry.color ?? "") ? entry.color : "",
  parentId: typeof entry.parentId === "string" ? entry.parentId : "",
  order: Number.isFinite(entry.order) ? entry.order : 0,
  scope: entry.scope,
});

const sortEntries = (entries: DictionaryEntry[]) =>
  [...entries].sort(
    (a, b) =>
      a.section.localeCompare(b.section, "ru") ||
      a.order - b.order ||
      a.short.localeCompare(b.short, "ru"),
  );

/**
 * Первичное наполнение справочника и перенос старых подсказок.
 *
 * Старое хранение заменяло раздел целиком: `{...defaultSuggestions, ...parsed}`.
 * Поэтому если раздел есть в старом ключе, там лежит ПОЛНЫЙ набор — и общие
 * записи для него создавать нельзя, иначе каждая строка задвоится.
 */
const buildInitialDictionaries = (): DictionaryEntry[] => {
  const entries: DictionaryEntry[] = [];
  let legacy: Record<string, string[]> | null = null;

  const saved = localStorage.getItem(suggestionsStorageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        legacy = parsed as Record<string, string[]>;
      }
    } catch {
      legacy = null;
    }
  }

  Object.entries(defaultSuggestions).forEach(([section, items]) => {
    if (legacy && Object.prototype.hasOwnProperty.call(legacy, section)) return;
    items.forEach((text, index) => {
      entries.push({
        id: stableId("global", section, text),
        section,
        short: text,
        full: "",
        color: "",
        parentId: "",
        order: index,
        scope: "global",
      });
    });
  });

  Object.entries(legacy ?? {}).forEach(([section, items]) => {
    if (!Array.isArray(items)) return;
    items
      .filter((text): text is string => typeof text === "string" && text.trim() !== "")
      .forEach((text, index) => {
        entries.push({
          id: stableId("personal", section, text),
          section,
          short: text,
          full: "",
          color: "",
          parentId: "",
          order: index,
          scope: "personal",
        });
      });
  });

  return sortEntries(entries);
};

const loadDictionaries = (): DictionaryEntry[] => {
  const saved = localStorage.getItem(dictionariesStorageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as unknown;
      if (Array.isArray(parsed)) {
        return sortEntries(parsed.filter(isDictionaryEntry).map(normalizeEntry));
      }
    } catch {
      // Испорченное значение — не повод остаться без справочников: ниже
      // соберём их заново из умолчаний и старого ключа.
    }
  }

  const initial = buildInitialDictionaries();
  localStorage.setItem(dictionariesStorageKey, JSON.stringify(initial));
  return initial;
};

const saveDictionaries = (entries: DictionaryEntry[]) => {
  localStorage.setItem(dictionariesStorageKey, JSON.stringify(entries));
};

/**
 * Тексты для панели подсказок: сначала свои записи, затем общие, без повторов.
 *
 * Именно объединение, а не «личное заменяет общее»: в старом хранении личная
 * запись с тем же именем поля молча вытесняла общую целиком, и врач терял
 * записи, которых сам не удалял.
 */
const suggestionTextsFor = (entries: DictionaryEntry[], section: string) => {
  const own = entries.filter((entry) => entry.section === section && entry.scope === "personal");
  const common = entries.filter((entry) => entry.section === section && entry.scope === "global");
  const seen = new Set<string>();

  return [...own.sort((a, b) => a.order - b.order), ...common.sort((a, b) => a.order - b.order)]
    .map((entry) => entry.short)
    .filter((text) => {
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    });
};

/**
 * Разделы справочника — подписи полей формы.
 *
 * Отдельный список, а не `printFields`: у печатных полей свои названия
 * («Пациент: ФИО»), и раздел справочника с ними никогда бы не совпал с полем,
 * у которого врач вызвал подсказку. Порядок совпадает с порядком полей
 * в форме, чтобы раздел искался там же, где видели поле.
 *
 * Дубликаты возможны по смыслу («Врач» есть и в осмотре, и в УЗИ) — это одно
 * и то же поле по названию, поэтому Set оставляет один раздел.
 */
const dictionarySections = Array.from(
  new Set([
    "Фамилия",
    "Имя",
    "Отчество",
    "Дата рождения",
    "Телефон",
    "Дата записи",
    "Время приёма",
    "Полных лет",
    "Адрес",
    "Врач",
    "Консультация врача",
    "Жалобы",
    "Анамнез заболевания",
    "Наследственность по основному заболеванию",
    "Перенесенные заболевания",
    "Перенесенные операции",
    "Аллергии",
    "Общий осмотр",
    "Локальный осмотр",
    "Аппарат",
    "Глубокие вены правая нижняя конечность",
    "Глубокие вены левая нижняя конечность",
    "Правая нижняя конечность: бассейн БПВ",
    "Правая нижняя конечность: бассейн МПВ",
    "Левая нижняя конечность: бассейн БПВ",
    "Левая нижняя конечность: бассейн МПВ",
    "Несостоятельные перфоранты",
    "Отек/лимфостаз",
    "Заключение",
    "Основное заболевание",
    "Код МКБ",
    "Сопутствующие заболевания",
    "Режим",
    "Медикаментозная терапия",
    "Немедикаментозная терапия, рекомендованные манипуляции",
    "Консультации специалистов",
    "План обследования",
    "Рекомендации",
    "Дата следующего визита",
    "Комментарии доктора",
    "Название и локализация",
    "Выполнено",
    "Результат",
  ]),
);

type SuggestionTarget = {
  label: string;
  insert: (value: string) => void;
};

const insertSuggestionWithSpacing = (currentValue: string, suggestion: string, start: number, end: number) => {
  const needsLeadingSpace = start > 0 && !/\s/.test(currentValue[start - 1]);
  const needsTrailingSpace =
    suggestion.length > 0 &&
    end < currentValue.length &&
    !/\s/.test(currentValue[end]) &&
    !/[.,;:!?)]/.test(currentValue[end]);
  const insertedText = `${needsLeadingSpace ? " " : ""}${suggestion}${needsTrailingSpace ? " " : ""}`;

  return {
    nextValue: `${currentValue.slice(0, start)}${insertedText}${currentValue.slice(end)}`,
    cursorPosition: start + insertedText.length,
  };
};

/**
 * Плотность интерфейса задана общими классами, а не повторяется в каждом поле.
 *
 * Зачем. Строк в приёме около сорока, и на «воздушной» вёрстке (подпись сверху,
 * поле снизу, отступ между ними) один приём занимал 4500 px — четыре с половиной
 * экрана. В прототипе, с которого программа писалась, подпись стоит СЛЕВА от
 * значения отдельной ячейкой, строки идут вплотную. Здесь то же самое: одна
 * строка = одна сетка «подпись | значение».
 *
 * Ширина колонки подписи: 196 px на десктопе (в неё влезает
 * «Немедикаментозная терапия, рекомендованные манипуляции» за три строки) и
 * 132 px на узких экранах, где важнее место под значение.
 */
const rowClass =
  "grid grid-cols-[132px_minmax(0,1fr)] border-b border-[#d7dce4] last:border-b-0 md:grid-cols-[196px_minmax(0,1fr)]";
const labelCellClass =
  "flex items-center border-r border-[#d7dce4] bg-[#eef1f5] px-1.5 py-[3px] text-[11px] font-normal leading-[1.2] text-[#3f4a5a]";
const valueCellClass =
  "rounded-none border-0 bg-white px-1.5 text-[12px] shadow-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/50 focus-visible:ring-offset-0";

type PanelMode = "dictionary" | "schedule";

const panelModeStorageKey = "clinicbase-panel-mode-v1";
const panelWidthStorageKey = "clinicbase-panel-width-v1";
const PANEL_MIN_WIDTH = 260;

/** Режим правой области помнится: врач открывает программу в своём режиме. */
const loadPanelMode = (): PanelMode =>
  localStorage.getItem(panelModeStorageKey) === "schedule" ? "schedule" : "dictionary";

const loadPanelWidth = () => {
  const saved = Number(localStorage.getItem(panelWidthStorageKey));
  return Number.isFinite(saved) && saved >= PANEL_MIN_WIDTH ? saved : 300;
};

/**
 * Ручка ширины панели. Тянется мышью и стрелками с клавиатуры: без клавиатуры
 * разделитель недоступен тем, кто работает без мыши, а это ещё и требование
 * доступности для role="separator".
 */
const PanelResizer = ({
  width,
  onChange,
}: {
  width: number;
  onChange: (next: number) => void;
}) => {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const clamp = (value: number) =>
    Math.max(PANEL_MIN_WIDTH, Math.min(Math.round(value), Math.round(window.innerWidth * 0.5)));

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Ширина панели"
      aria-valuenow={width}
      aria-valuemin={PANEL_MIN_WIDTH}
      aria-valuemax={Math.round(window.innerWidth * 0.5)}
      tabIndex={0}
      data-testid="panel-resizer"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { startX: event.clientX, startWidth: width };
      }}
      onPointerMove={(event) => {
        if (!dragRef.current) return;
        // Тянем влево — панель шире, поэтому дельта вычитается.
        onChange(clamp(dragRef.current.startWidth - (event.clientX - dragRef.current.startX)));
      }}
      onPointerUp={(event) => {
        dragRef.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        dragRef.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onChange(clamp(width + 16));
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          onChange(clamp(width - 16));
        }
      }}
      className="group hidden cursor-col-resize items-stretch justify-center rounded-sm focus-visible:bg-[#c6ced9] focus-visible:outline-none xl:flex"
    >
      <span className="w-[2px] bg-transparent transition-colors group-hover:bg-[#9aa6b6]" />
    </div>
  );
};

/** «2026-06-10» → «10.06.2026». В графике дата нужна в привычном виде. */
const formatDateRu = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value || "—";
};

/**
 * Шапка правой области. Одна на два режима, иначе подпись режима и
 * переключатель пришлось бы дублировать, и они разъехались бы.
 */
const PanelHeader = ({
  title,
  count,
  mode,
  onToggleMode,
  onReset,
}: {
  title: string;
  count?: number;
  mode: PanelMode;
  onToggleMode: () => void;
  onReset?: () => void;
}) => (
  <div className="flex items-center gap-1 border-b border-[#c6ced9] bg-[#dfe4ea] px-1.5 py-1">
    <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#33405a]">{title}</h2>
    {count !== undefined ? (
      <span className="ml-auto rounded-sm bg-[#c9d2de] px-1 text-[10px] font-medium text-[#33405a]">
        {count}
      </span>
    ) : null}
    <button
      type="button"
      onClick={onToggleMode}
      aria-pressed={mode === "schedule"}
      data-testid="panel-mode-toggle"
      title={mode === "schedule" ? "Показать справочники" : "Показать график приёмов"}
      className={`rounded-sm border px-1 text-[10px] leading-[15px] transition-colors ${
        count === undefined ? "ml-auto" : ""
      } ${
        mode === "schedule"
          ? "border-[#185fa5] bg-[#e6f1fb] text-[#0c447c]"
          : "border-[#c6ced9] bg-white text-[#5a6675] hover:text-foreground"
      }`}
    >
      Информация
    </button>
    {onReset ? (
      <button
        type="button"
        onClick={onReset}
        aria-label="Сбросить выбор поля"
        className="rounded-sm p-0.5 text-[#5a6675] transition-colors hover:bg-white/60 hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    ) : null}
  </div>
);

/**
 * График — расписание приёмов пациента. Второй режим области «Информация».
 *
 * Приёмы другого врача показываются розовым и не открываются: раскрыть запись
 * может только тот, кто её вёл. Поэтому у такой строки нет ни клика, ни
 * двойного клика, а в подсказке написано почему.
 */
const SchedulePanel = ({
  visits,
  doctorId,
  selectedVisitId,
  onSelect,
  onOpen,
  onCopyProtocol,
  onToggleMode,
}: {
  visits: Visit[];
  doctorId: string;
  selectedVisitId: string;
  onSelect: (visitId: string) => void;
  onOpen: (visitId: string) => void;
  onCopyProtocol: (visitId: string) => void;
  onToggleMode: () => void;
}) => {
  const selected = visits.find((visit) => visit.id === selectedVisitId) ?? null;
  const canCopy = Boolean(selected) && selected?.doctorId === doctorId;

  return (
    <aside
      data-testid="schedule-panel"
      className="flex min-w-0 flex-col rounded-sm border border-[#c6ced9] bg-[#f4f6f9] xl:sticky xl:top-1.5 xl:h-[calc(100vh-4.75rem)]"
    >
      <PanelHeader title="График" mode="schedule" onToggleMode={onToggleMode} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Четыре колонки в 300 px не читаются: «10.06.2026» обрезается до
            «10.06.20…». Поэтому строка двухстрочная — дата, время и врач
            сверху, протокол снизу. Поля те же, что в прототипе, но без
            горизонтальной прокрутки. */}
        <div className="flex items-center gap-1 border-b border-[#c6ced9] bg-[#eef1f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#3f4a5a]">
          <span>Дата</span>
          <span>Время</span>
          <span className="ml-auto">Доктор</span>
        </div>
        {visits.map((visit) => {
          const foreign = visit.doctorId !== doctorId;
          const active = visit.id === selectedVisitId;
          return (
            <div
              key={visit.id}
              data-testid="schedule-row"
              data-foreign={foreign ? "true" : "false"}
              data-active={active ? "true" : "false"}
              onClick={() => {
                if (!foreign) onSelect(visit.id);
              }}
              onDoubleClick={() => {
                if (!foreign) onOpen(visit.id);
              }}
              title={
                foreign
                  ? "Приём другого врача — открыть может только он"
                  : "Двойной щелчок — открыть приём"
              }
              className={`border-b border-[#e1e5eb] px-1.5 py-[3px] text-[10px] leading-tight ${
                foreign
                  ? "cursor-not-allowed bg-[#f7dce5] text-[#8a3a52]"
                  : "cursor-pointer hover:bg-[#e3e9f2]"
              } ${active && !foreign ? "bg-[#cfe3f7]" : ""}`}
            >
              <div className="flex items-baseline gap-1">
                <span className="font-medium">{formatDateRu(visit.recordDate)}</span>
                <span className="text-[#5a6675]">{visit.recordTime || "—"}</span>
                <span className="ml-auto min-w-0 truncate" title={visit.doctorName}>
                  {visit.doctorName}
                </span>
              </div>
              <div className="truncate text-[#3f4a5a]" title={visit.consultationType}>
                {visit.consultationType || "—"}
              </div>
            </div>
          );
        })}
        {visits.length === 0 ? (
          <p className="px-1.5 py-2 text-[11px] text-muted-foreground">Приёмов пока нет.</p>
        ) : null}
      </div>

      <div className="border-t border-[#c6ced9] bg-[#e7ebf1] p-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!canCopy}
          data-testid="copy-protocol"
          onClick={() => {
            if (selected) onCopyProtocol(selected.id);
          }}
          className="h-6 w-full px-2 text-[11px]"
        >
          <Copy className="mr-1 h-3 w-3" />
          Копировать протокол
        </Button>
        <p className="mt-1 text-[10px] leading-snug text-[#5a6675]">
          {!selected
            ? "Нет приёма, который можно скопировать."
            : !canCopy
              ? "Протокол другого врача скопировать нельзя."
              : "Создастся новый приём: текущий и выбранный не изменятся."}
        </p>
      </div>
    </aside>
  );
};

const SuggestionPanel = ({
  label,
  entries,
  phrase,
  onPhraseChange,
  onAdd,
  onDelete,
  onPick,
  onClose,
  onToggleMode,
  onOpenDictionaries,
}: {
  label: string;
  entries: DictionaryEntry[];
  phrase: string;
  onPhraseChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (value: string) => void;
  onPick: (value: string) => void;
  onClose: () => void;
  onToggleMode: () => void;
  onOpenDictionaries: () => void;
}) => {
  const [filter, setFilter] = useState("");
  const query = filter.trim().toLowerCase();
  // Ищем и по краткому имени, и по полному тексту: врач помнит формулировку,
  // а не то, как он её сократил.
  const visible = query
    ? entries.filter(
        (entry) =>
          entry.short.toLowerCase().includes(query) || entry.full.toLowerCase().includes(query),
      )
    : entries;

  return (
    <aside
      data-testid="suggestion-panel"
      className="flex min-w-0 flex-col rounded-sm border border-[#c6ced9] bg-[#f4f6f9] xl:sticky xl:top-1.5 xl:h-[calc(100vh-4.75rem)]"
    >
      <PanelHeader
        title="Справочники"
        count={visible.length}
        mode="dictionary"
        onToggleMode={onToggleMode}
        onReset={onClose}
      />

      {label ? (
        <>
          <p
            className="truncate border-b border-[#d7dce4] bg-[#eef1f5] px-1.5 py-1 text-[11px] font-medium text-foreground"
            title={label}
          >
            {label}
          </p>
          <div className="flex items-center gap-1 border-b border-[#d7dce4] p-1">
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Фильтр справочника"
              aria-label="Фильтр справочника"
              className="h-6 rounded-sm border-[#c6ced9] px-1.5 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onOpenDictionaries}
              className="h-6 shrink-0 px-1.5 text-[11px]"
              data-testid="open-dictionaries"
              title="Открыть справочники: правка, цвет, печать"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          {/* Строки вплотную, без рамок и отступов между ними: в прототипе
              справочник — это плотный текстовый столбец, а не карточки.
              На экране 900 px так помещается около 40 записей вместо 12. */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visible.length > 0 ? (
              visible.map((entry) => (
                <div
                  key={entry.id}
                  data-testid="dictionary-row"
                  data-scope={entry.scope}
                  className="group flex items-start border-b border-[#e1e5eb] last:border-b-0 hover:bg-[#e3e9f2]"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 px-1.5 py-[2px] text-left text-[11px] leading-[1.25]"
                    // Цвет приходит из справочника: врач помечает им записи,
                    // которые нельзя перепутать (например, «не выводить
                    // на печать»).
                    style={entry.color ? { color: entry.color } : undefined}
                    title={entry.full || entry.short}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onPick(entry.short)}
                  >
                    {entry.short}
                  </button>
                  {entry.scope === "personal" ? (
                    <button
                      type="button"
                      className="w-4 shrink-0 py-[2px] text-center text-[11px] leading-[1.25] text-[#98a2b3] opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onDelete(entry.short)}
                      aria-label={`Удалить запись: ${entry.short}`}
                    >
                      ×
                    </button>
                  ) : (
                    // Общая запись принадлежит всем врачам — из узкой панели
                    // её не удаляют, для этого есть экран «Справочники».
                    <span className="w-4 shrink-0" aria-hidden="true" />
                  )}
                </div>
              ))
            ) : (
              <p className="px-1.5 py-1 text-[11px] text-muted-foreground">
                {query ? "Ничего не найдено." : "Записей пока нет."}
              </p>
            )}
          </div>
          <div className="border-t border-[#c6ced9] bg-[#e7ebf1] p-1">
            <div className="flex gap-1">
              <Input
                className="h-6 rounded-sm border-[#c6ced9] px-1.5 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
                value={phrase}
                placeholder="Новая запись"
                aria-label="Новая запись"
                onChange={(event) => onPhraseChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAdd();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onAdd}
                className="h-6 shrink-0 px-2 text-[11px]"
                aria-label="Добавить запись"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="p-2 text-[11px] leading-snug text-muted-foreground">
          Щёлкните по любому полю — здесь появятся записи справочника для него.
        </p>
      )}
    </aside>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  onActivateSuggestions,
  stacked = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  onActivateSuggestions?: (target: SuggestionTarget) => void;
  /** Подпись над полем вместо ячейки слева — для форм входа, где нет таблицы. */
  stacked?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const inputId = useId();
  const suggestionsEnabled = type === "text" && Boolean(onActivateSuggestions);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const activateSuggestions = () => {
    if (!suggestionsEnabled) return;
    onActivateSuggestions?.({
      label,
      insert: (suggestion: string) => {
        const currentValue = valueRef.current;
    const input = inputRef.current;
        const start = input?.selectionStart ?? currentValue.length;
        const end = input?.selectionEnd ?? currentValue.length;
        const { nextValue, cursorPosition } = insertSuggestionWithSpacing(
          currentValue,
          suggestion,
          start,
          end,
        );
    onChange(nextValue);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(cursorPosition, cursorPosition);
    });
      },
    });
  };

  return (
    <div className={stacked ? "space-y-1.5" : rowClass}>
      <Label htmlFor={inputId} className={stacked ? undefined : labelCellClass}>
        {label}
      </Label>
      <Input
        id={inputId}
        ref={inputRef}
        type={type}
        value={value}
        onFocus={activateSuggestions}
        onChange={(event) => onChange(event.target.value)}
        className={stacked ? undefined : `h-7 ${valueCellClass}`}
      />
    </div>
  );
};

const Area = ({
  label,
  value,
  onChange,
  rows = 1,
  onActivateSuggestions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  onActivateSuggestions?: (target: SuggestionTarget) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  const textareaId = useId();

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useLayoutEffect(() => {
    resizeTextarea();
    const resizeFrame = requestAnimationFrame(resizeTextarea);
    return () => cancelAnimationFrame(resizeFrame);
  }, [value]);

  const activateSuggestions = () => {
    onActivateSuggestions?.({
      label,
      insert: (suggestion: string) => {
        const currentValue = valueRef.current;
    const textarea = textareaRef.current;
        const start = textarea?.selectionStart ?? currentValue.length;
        const end = textarea?.selectionEnd ?? currentValue.length;
        const { nextValue, cursorPosition } = insertSuggestionWithSpacing(
          currentValue,
          suggestion,
          start,
          end,
        );
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(cursorPosition, cursorPosition);
    });
      },
    });
  };

  return (
    <div className={rowClass}>
      {/* `items-start pt-1` — чтобы подпись стояла на уровне первой строки
          текста, а не по центру многострочного поля. */}
      <Label htmlFor={textareaId} className={`${labelCellClass} items-start pt-1`}>
        {label}
      </Label>
      <Textarea
        id={textareaId}
        ref={textareaRef}
        rows={rows}
        value={value}
        className={`min-h-7 resize-none overflow-hidden py-[7px] leading-[1.3] ${valueCellClass}`}
        onFocus={() => {
          activateSuggestions();
          resizeTextarea();
        }}
        onChange={(event) => {
          onChange(event.target.value);
          requestAnimationFrame(resizeTextarea);
        }}
      />
    </div>
  );
};

const RecordSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => (
  <details className="group rounded-sm border border-[#c6ced9] bg-white" open={defaultOpen}>
    <summary className="flex cursor-pointer select-none list-none items-center gap-1 border-[#c6ced9] bg-[#dfe4ea] px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#33405a] transition-colors hover:bg-[#d6dce5] group-open:border-b [&::-webkit-details-marker]:hidden">
      <ChevronRight className="h-3 w-3 shrink-0 transition-transform group-open:rotate-90" />
      {title}
    </summary>
    <div>{children}</div>
  </details>
);

const PrintRecord = ({
  template,
  patient,
  visit,
  className = "",
}: {
  template: PrintTemplate;
  patient: Patient;
  visit: Visit;
  className?: string;
}) => {
  const selectedFields = template.fieldKeys
    .map((fieldKey) => printFields.find((field) => field.key === fieldKey))
    .filter(Boolean) as PrintField[];

  return (
    <div className={`print-area rounded-md border bg-white p-6 ${className}`}>
      <p className="text-sm text-muted-foreground">{template.name}</p>
      <h2 className="mt-2 text-2xl font-semibold">{getPatientFullName(patient)}</h2>
      {template.intro && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{template.intro}</p>
      )}
      <div className="mt-5 space-y-3 text-sm leading-6">
        {selectedFields.map((field) => {
          const value = getPrintFieldValue(field, patient, visit);
          if (!value) return null;

          return (
            <div key={field.key}>
              <strong>{field.label}:</strong>
              <div className="whitespace-pre-wrap">{value}</div>
            </div>
          );
        })}
      </div>
      {template.outro && (
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6">{template.outro}</p>
      )}
    </div>
  );
};

/**
 * Выбор пациента — раскрывающийся список в верхней панели.
 *
 * Раньше пациенты занимали отдельную колонку слева: 248 px ширины и весь экран
 * по высоте. Колонка отбирала место ровно у того, ради чего экран открывают —
 * у полей истории болезни и у списка подсказок. При этом список нужен редко и
 * короткими наскоками: врач выбрал пациента и дальше весь приём работает в
 * форме. Поэтому выбор убран в выпадающее окно, а освободившееся место отдано
 * форме.
 *
 * Поиск живёт внутри окна, а не в состоянии экрана: иначе набранный фильтр
 * пережил бы закрытие и список открылся бы обрезанным — пациент «пропал» бы
 * без видимой причины.
 */
const PatientPicker = ({
  patients,
  selectedPatientId,
  visitCountByPatient,
  nearestNextVisitByPatient,
  onSelect,
}: {
  patients: Patient[];
  selectedPatientId: string;
  visitCountByPatient: Map<string, number>;
  nearestNextVisitByPatient: Map<string, string>;
  onSelect: (patientId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const selected = patients.find((patient) => patient.id === selectedPatientId);
  const query = filter.trim().toLowerCase();
  const visible = query
    ? patients.filter((patient) =>
        `${patient.lastName} ${patient.firstName} ${patient.middleName} ${patient.phone}`
          .toLowerCase()
          .includes(query),
      )
    : patients;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setFilter("");
  };

  return (
    <div className="flex items-center gap-1">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Пациент</Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-testid="patient-picker"
            aria-label="Выбрать пациента"
            className="flex h-6 w-[210px] items-center gap-1 rounded-sm border border-[#c6ced9] bg-white px-1 text-left text-[11px] transition-colors hover:border-[#a9b6c8]"
          >
            <UserRound className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span
              className={`min-w-0 flex-1 truncate ${selected ? "" : "text-muted-foreground"}`}
              title={
                selected
                  ? `${selected.lastName} ${selected.firstName} ${selected.middleName}`.trim()
                  : undefined
              }
            >
              {selected
                ? `${selected.lastName} ${selected.firstName} ${selected.middleName}`.trim()
                : "не выбран"}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={3}
          className="w-[340px] rounded-sm border-[#c6ced9] p-0"
        >
          <div className="border-b border-[#c6ced9] bg-[#eef1f5] p-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-1 top-[7px] h-3 w-3 text-muted-foreground" />
              <Input
                autoFocus
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Фамилия, имя или телефон"
                aria-label="Поиск пациента"
                className="h-6 rounded-sm border-[#c6ced9] bg-white pl-5 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <div className="max-h-[330px] overflow-y-auto" data-testid="patient-picker-list">
            {visible.length > 0 ? (
              visible.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                const nextVisitDate = nearestNextVisitByPatient.get(patient.id) ?? "";
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      onSelect(patient.id);
                      handleOpenChange(false);
                    }}
                    className={`flex w-full items-start gap-1 border-b border-[#e1e5eb] px-1.5 py-[3px] text-left transition-colors last:border-b-0 ${
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-[#e3e9f2]"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] leading-[1.25]">
                        {patient.lastName} {patient.firstName} {patient.middleName}
                      </span>
                      <span className="block truncate text-[10px] leading-[1.25] text-muted-foreground">
                        {patient.phone || "телефон не указан"} · приёмов:{" "}
                        {visitCountByPatient.get(patient.id) ?? 0}
                      </span>
                      {nextVisitDate && (
                        <span className="block truncate text-[10px] font-semibold leading-[1.25] text-red-600">
                          Следующий приём: {nextVisitDate}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="mt-[2px] h-3 w-3 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <p className="px-1.5 py-2 text-[11px] text-muted-foreground">Никого не найдено.</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/**
 * Печать справочника.
 *
 * Отдельным окном, а не `window.print()` на месте: печатается документ, а не
 * диалог. Radix рисует содержимое в портале, и при печати браузеры ведут себя
 * по-разному — от «напечатался пустой лист» до «напечатался весь интерфейс».
 */
const printDictionaries = (entries: DictionaryEntry[], scope: DictionaryScope, scopeTitle: string) => {
  const bySection = new Map<string, DictionaryEntry[]>();
  entries
    .filter((entry) => entry.scope === scope)
    .forEach((entry) => {
      const bucket = bySection.get(entry.section) ?? [];
      bucket.push(entry);
      bySection.set(entry.section, bucket);
    });

  const sectionsHtml = Array.from(bySection.entries())
    .map(([section, items]) => {
      const rows = [...items]
        .sort((a, b) => a.order - b.order || a.short.localeCompare(b.short, "ru"))
        .map((entry) => {
          const color = entry.color ? ` style="color:${entry.color}"` : "";
          // Полный текст печатаем, только если он отличается от краткого:
          // иначе каждая строка задвоится.
          const full =
            entry.full && entry.full !== entry.short
              ? `<div class="full">${escapeHtml(entry.full).replace(/\n/g, "<br>")}</div>`
              : "";
          return `<tr><td${color}>${escapeHtml(entry.short)}${full}</td></tr>`;
        })
        .join("");
      return `<h2>${escapeHtml(section)}</h2><table>${rows}</table>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Справочники — ${escapeHtml(scopeTitle)}</title>
  <style>
    body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.3; margin: 18mm; }
    h1 { font-size: 16pt; margin: 0 0 4mm; }
    h2 { font-size: 13pt; margin: 6mm 0 2mm; border-bottom: 1px solid #999; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1mm 0; vertical-align: top; }
    .full { font-size: 10pt; color: #444; }
    @media print { h2 { break-after: avoid; } }
  </style>
</head>
<body>
  <h1>Справочники — ${escapeHtml(scopeTitle)}</h1>
  ${sectionsHtml || "<p>Записей нет.</p>"}
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=760");
  if (!printWindow) return false;

  printWindow.document.write(html);
  printWindow.document.close();
  // Небольшая задержка: сразу после write документ ещё не разобран,
  // и print() в Safari печатает пустую страницу.
  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 150);
  return true;
};

/**
 * Экран справочников: список разделов, записи и редактор.
 *
 * Отдельный экран, а не расширение узкой панели, потому что здесь у записи
 * четыре свойства (краткое имя, полный текст, цвет, подпункт) — в 300 px
 * панели они не помещаются, а простыня из полей в панели мешала бы работать
 * с протоколом.
 */
const DictionariesDialog = ({
  open,
  onOpenChange,
  entries,
  initialSection,
  onSave,
  onDelete,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: DictionaryEntry[];
  initialSection: string;
  onSave: (entry: DictionaryEntry) => void;
  onDelete: (entry: DictionaryEntry) => void;
  onImport: (section: string, items: Array<{ short: string; full: string }>) => Promise<number>;
}) => {
  const [scope, setScope] = useState<DictionaryScope>("personal");
  const [section, setSection] = useState(initialSection);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<DictionaryEntry | null>(null);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSection(initialSection);
    setSearch("");
    setDraft(null);
    setImportMode(false);
    setImportText("");
  }, [open, initialSection]);

  // Разделы — поля формы плюс всё, что уже встречается в записях. Второе
  // важно: справочник мог наполниться для поля, которого в форме нет.
  const sections = useMemo(() => {
    const known = new Set(dictionarySections);
    entries.forEach((entry) => known.add(entry.section));
    return Array.from(known);
  }, [entries]);

  const countInSection = (name: string, target: DictionaryScope) =>
    entries.filter((entry) => entry.section === name && entry.scope === target).length;

  const sectionEntries = entries.filter(
    (entry) => entry.section === section && entry.scope === scope,
  );
  const query = search.trim().toLowerCase();
  const visible = query
    ? sectionEntries.filter(
        (entry) =>
          entry.short.toLowerCase().includes(query) || entry.full.toLowerCase().includes(query),
      )
    : sectionEntries;

  const startNew = () => {
    setImportMode(false);
    setDraft({
      id: crypto.randomUUID(),
      section,
      short: "",
      full: "",
      color: "",
      parentId: "",
      order: entries
        .filter((entry) => entry.section === section)
        .reduce((max, entry) => Math.max(max, entry.order + 1), 0),
      scope,
    });
  };

  const commitDraft = () => {
    if (!draft) return;
    const short = draft.short.trim();
    if (!short) return;
    onSave({ ...draft, short, full: draft.full.trim() });
    setDraft(null);
  };

  const startImport = async () => {
    setDraft(null);
    setImportMode(true);
    // Пробуем прочитать буфер сразу: если браузер разрешает — врач увидит
    // готовый текст и просто нажмёт «Вставить». Если нет, поле останется
    // пустым и он вставит вручную.
    try {
      const clipboard = await navigator.clipboard.readText();
      if (clipboard.trim()) setImportText(clipboard);
    } catch {
      // Разрешения нет — это нормально, ничего не делаем.
    }
  };

  const runImport = async () => {
    const items = importText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // Строка «краткое | полное»: разделитель — вертикальная черта или
        // табуляция. Всё, что до него, вставляется в текст, всё после —
        // раскрывается в подсказке.
        const [shortPart, ...rest] = line.split(/\s*[|\t]\s*/);
        return { short: shortPart.trim(), full: rest.join(" | ").trim() };
      })
      .filter((item) => item.short);

    if (items.length === 0) return;
    await onImport(section, items);
    setImportMode(false);
    setImportText("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1120px] gap-3 p-4"
        data-testid="dictionaries-dialog"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">Справочники</DialogTitle>
          <DialogDescription className="text-[11px]">
            Краткое имя вставляется в протокол, полный текст раскрывается в подсказке и идёт
            на печать. Цвет помогает не перепутать записи.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-sm border border-[#c6ced9] p-0.5" role="tablist">
            {([
              ["personal", "Мои"],
              ["global", "Общие"],
            ] as Array<[DictionaryScope, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={scope === value}
                data-testid={`dictionaries-tab-${value}`}
                onClick={() => {
                  setScope(value);
                  setDraft(null);
                  setImportMode(false);
                  // Если в открытом разделе записей этой области нет, оставлять
                  // его бессмысленно: врач увидит пустой список и решит, что
                  // справочник пуст. Переходим к первому разделу, где записи
                  // есть, — но только когда текущий пуст.
                  const hasInSection = entries.some(
                    (entry) => entry.section === section && entry.scope === value,
                  );
                  if (!hasInSection) {
                    const firstFilled = sections.find((name) =>
                      entries.some((entry) => entry.section === name && entry.scope === value),
                    );
                    if (firstFilled) setSection(firstFilled);
                  }
                }}
                className={`h-6 px-2.5 text-[11px] ${
                  scope === value
                    ? "rounded-sm bg-secondary/10 font-semibold text-secondary"
                    : "text-[#5a6675] hover:bg-[#eef1f5]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] leading-tight text-muted-foreground">
            {scope === "global"
              ? "Изменения в общем справочнике видны всем врачам."
              : "Личный справочник видите только вы."}
          </p>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              data-testid="dictionary-import"
              onClick={startImport}
            >
              <Download className="mr-1 h-3 w-3" />
              Вставить из буфера
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              data-testid="dictionary-print"
              onClick={() => {
                const printed = printDictionaries(
                  entries,
                  scope,
                  scope === "global" ? "общие" : "мои",
                );
                if (!printed) {
                  window.alert("Браузер заблокировал окно печати. Разрешите всплывающие окна.");
                }
              }}
            >
              <Printer className="mr-1 h-3 w-3" />
              Печать
            </Button>
            <Button
              size="sm"
              className="h-6 px-2 text-[11px]"
              data-testid="dictionary-add"
              onClick={startNew}
            >
              <Plus className="mr-1 h-3 w-3" />
              Запись
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 gap-2 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
          {/* Разделы */}
          <aside className="max-h-[58vh] overflow-y-auto rounded-sm border border-[#c6ced9] bg-[#f4f6f9]">
            {sections.map((name) => {
              const count = countInSection(name, scope);
              const active = name === section;
              return (
                <button
                  key={name}
                  type="button"
                  data-testid="dictionary-section"
                  data-active={active}
                  onClick={() => {
                    setSection(name);
                    setDraft(null);
                    setImportMode(false);
                  }}
                  className={`flex w-full items-baseline gap-1 border-b border-[#e1e5eb] px-1.5 py-[3px] text-left text-[11px] leading-[1.25] last:border-b-0 ${
                    active ? "bg-secondary/10 font-semibold text-secondary" : "hover:bg-[#e3e9f2]"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate" title={name}>
                    {name}
                  </span>
                  <span className={`shrink-0 text-[10px] ${count === 0 ? "text-[#b6bec9]" : "text-[#5a6675]"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Записи выбранного раздела */}
          <section className="flex max-h-[58vh] min-w-0 flex-col rounded-sm border border-[#c6ced9] bg-white">
            <div className="border-b border-[#d7dce4] bg-[#eef1f5] px-1.5 py-1">
              <p className="truncate text-[11px] font-medium" title={section}>
                {section || "Выберите раздел"}
              </p>
            </div>
            <div className="border-b border-[#d7dce4] p-1">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по краткому и полному тексту"
                aria-label="Поиск по справочнику"
                className="h-6 rounded-sm border-[#c6ced9] px-1.5 text-[11px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {visible.length > 0 ? (
                visible.map((entry) => (
                  <div
                    key={entry.id}
                    data-testid="dictionary-entry"
                    className={`group flex items-start gap-1 border-b border-[#e1e5eb] last:border-b-0 ${
                      draft?.id === entry.id ? "bg-secondary/10" : "hover:bg-[#e3e9f2]"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 px-1.5 py-[3px] text-left text-[11px] leading-[1.25]"
                      onClick={() => {
                        setImportMode(false);
                        setDraft({ ...entry });
                      }}
                    >
                      <span
                        className="block truncate"
                        style={entry.color ? { color: entry.color } : undefined}
                        title={entry.full || entry.short}
                      >
                        {entry.short}
                      </span>
                      {entry.full && entry.full !== entry.short ? (
                        <span className="block truncate text-[10px] text-[#7a8697]">{entry.full}</span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className="w-5 shrink-0 py-[3px] text-center text-[12px] leading-[1.25] text-[#98a2b3] opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      aria-label={`Удалить запись: ${entry.short}`}
                      onClick={() => onDelete(entry)}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="px-1.5 py-2 text-[11px] text-muted-foreground">
                  {query ? "Ничего не найдено." : "Записей нет. Добавьте первую."}
                </p>
              )}
            </div>
          </section>

          {/* Редактор */}
          <section className="flex max-h-[58vh] min-w-0 flex-col overflow-y-auto rounded-sm border border-[#c6ced9] bg-[#f7f8fa] p-2">
            {importMode ? (
              <div className="space-y-2">
                <p className="text-[11px] font-medium">Вставить из буфера</p>
                <p className="text-[10px] leading-snug text-muted-foreground">
                  Одна строка — одна запись. Нужны и краткое имя, и полный текст — разделите их
                  вертикальной чертой: <span className="whitespace-nowrap">Отечность | Отёки голеней к вечеру</span>.
                </p>
                <Textarea
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder={"Тяжесть в ногах к вечеру\nОтечность голеней | Отёки голеней и стоп к вечеру"}
                  aria-label="Строки для вставки"
                  data-testid="dictionary-import-text"
                  className="min-h-[180px] bg-white text-[11px]"
                />
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-6 px-2 text-[11px]" onClick={runImport}>
                    <Check className="mr-1 h-3 w-3" />
                    Вставить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => {
                      setImportMode(false);
                      setImportText("");
                    }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : draft ? (
              <div className="space-y-2">
                <p className="text-[11px] font-medium">
                  {entries.some((entry) => entry.id === draft.id) ? "Изменить запись" : "Новая запись"}
                </p>
                <div className="space-y-1">
                  <Label htmlFor="dictionary-short" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Краткое имя
                  </Label>
                  <Textarea
                    id="dictionary-short"
                    data-testid="dictionary-edit-short"
                    value={draft.short}
                    onChange={(event) => setDraft({ ...draft, short: event.target.value })}
                    className="min-h-[54px] bg-white text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dictionary-full" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Полный текст
                  </Label>
                  <Textarea
                    id="dictionary-full"
                    data-testid="dictionary-edit-full"
                    value={draft.full}
                    onChange={(event) => setDraft({ ...draft, full: event.target.value })}
                    className="min-h-[90px] bg-white text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Цвет шрифта
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {dictionaryColors.map((color) => (
                      <button
                        key={color.value || "default"}
                        type="button"
                        title={color.label}
                        aria-label={color.label}
                        aria-pressed={draft.color === color.value}
                        onClick={() => setDraft({ ...draft, color: color.value })}
                        className={`h-5 w-5 rounded-sm border ${
                          draft.color === color.value ? "ring-2 ring-secondary ring-offset-1" : ""
                        }`}
                        style={{
                          backgroundColor: color.value || "#ffffff",
                          borderColor: "#c6ced9",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dictionary-parent" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Подпункт к записи
                  </Label>
                  <select
                    id="dictionary-parent"
                    className="h-6 w-full rounded-sm border border-[#c6ced9] bg-white px-1 text-[11px]"
                    value={draft.parentId}
                    onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}
                  >
                    <option value="">— самостоятельная запись —</option>
                    {entries
                      .filter(
                        (entry) =>
                          entry.section === draft.section &&
                          entry.scope === draft.scope &&
                          entry.id !== draft.id,
                      )
                      .map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.short}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    data-testid="dictionary-save"
                    disabled={!draft.short.trim()}
                    onClick={commitDraft}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    ОК
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px]"
                    data-testid="dictionary-cancel"
                    onClick={() => setDraft(null)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] leading-snug text-muted-foreground">
                Выберите запись слева, чтобы изменить её, или нажмите «Запись», чтобы добавить новую.
              </p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DoctorDatabase = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState(loadDoctorUsers);
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState(loadRecords);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatients[0]?.id ?? "");
  const [selectedVisitId, setSelectedVisitId] = useState(initialVisits[0]?.id ?? "");
  const [printTemplates, setPrintTemplates] = useState(loadPrintTemplates);
  const [selectedPrintTemplateId, setSelectedPrintTemplateId] = useState(
    () => loadPrintTemplates()[0]?.id ?? defaultPrintTemplates[0].id,
  );
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [templateSettingsOpen, setTemplateSettingsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [activeSuggestionTarget, setActiveSuggestionTarget] = useState<SuggestionTarget | null>(null);
  const [suggestionPhrase, setSuggestionPhrase] = useState("");
  const [panelMode, setPanelMode] = useState<PanelMode>(loadPanelMode);
  const [panelWidth, setPanelWidth] = useState(loadPanelWidth);
  const [scheduleSelectionId, setScheduleSelectionId] = useState("");
  const [dictionaryEntries, setDictionaryEntries] = useState(loadDictionaries);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [dictionarySection, setDictionarySection] = useState("");
  const recordsRef = useRef(records);
  const dictionaryRef = useRef(dictionaryEntries);
  const pendingActionRef = useRef<((sourceRecords: MedicalRecords) => void) | null>(null);

  useEffect(() => {
    dictionaryRef.current = dictionaryEntries;
  }, [dictionaryEntries]);

  useEffect(() => {
    localStorage.setItem(panelModeStorageKey, panelMode);
  }, [panelMode]);

  useEffect(() => {
    localStorage.setItem(panelWidthStorageKey, String(panelWidth));
  }, [panelWidth]);

  // Ширина хранится в пикселях, но окно могло стать уже — не даём панели
  // занять больше половины экрана.
  const panelWidthPx = Math.max(
    PANEL_MIN_WIDTH,
    Math.min(panelWidth, Math.round(window.innerWidth * 0.5)),
  );

  /**
   * Сведение справочников с сервером.
   *
   * Сервер — источник истины для того, что на нём уже есть, но записи,
   * созданные в офлайне, там отсутствуют. Молча выбросить их значило бы
   * стереть работу врача, поэтому недостающие остаются и досылаются следом.
   */
  const mergeServerDictionaries = (serverEntries: DictionaryEntry[]) => {
    const localEntries = dictionaryRef.current;
    const serverIds = new Set(serverEntries.map((entry) => entry.id));
    const missing = localEntries.filter((entry) => !serverIds.has(entry.id));
    const merged = sortEntries([...serverEntries.map(normalizeEntry), ...missing]);

    dictionaryRef.current = merged;
    setDictionaryEntries(merged);
    saveDictionaries(merged);
    missing.forEach((entry) => {
      apiSaveDictionaryEntry(entry).catch(() => undefined);
    });
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {      const localSession = loadAuthSession();
      let availableDoctors = loadDoctorUsers();
      let availableRecords = loadRecords();
      let activeSession = localSession;

      try {
        const [serverSession, serverDoctors, serverRecords, serverDictionary] = await Promise.all([
          apiGetSession(),
          apiGetDoctors(),
          apiGetRecords(),
          apiGetDictionaries(),
        ]);
        activeSession = serverSession ?? localSession;
        availableDoctors = serverDoctors;
        availableRecords = serverRecords as MedicalRecords;

        // Справочники сводим, а не затираем: записи, созданные в офлайне,
        // на сервере отсутствуют, и молча выбросить их значило бы стереть
        // работу врача. Недостающие отправляем следом — тихо, чтобы
        // недоступный сервер не мешал работать.
        if (!cancelled && Array.isArray(serverDictionary)) {
          mergeServerDictionaries(serverDictionary as DictionaryEntry[]);
        }
      } catch (error) {
        if (!isApiUnavailable(error) && !cancelled) {
          toast({ title: "Сервер недоступен", description: "Открыт локальный демо-режим." });
        }
      }

      if (cancelled) return;
      setDoctors(availableDoctors);
      recordsRef.current = availableRecords;
      setRecords(availableRecords);

      if (activeSession?.role !== "doctor") return;
      const sessionDoctor = availableDoctors.find((item) => item.id === activeSession.doctorId);
      if (sessionDoctor) {
        selectDoctor(sessionDoctor, availableRecords);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const nearestNextVisitByPatient = useMemo(() => {
    const nextDates = new Map<string, string>();
    records.patients.forEach((patient) => {
      const nearestDate = getNearestNextVisitDate(records.visits, patient.id);
      if (nearestDate) {
        nextDates.set(patient.id, nearestDate);
      }
    });
    return nextDates;
  }, [records.patients, records.visits]);

  const visitCountByPatient = useMemo(() => {
    const counts = new Map<string, number>();
    records.visits.forEach((visit) => {
      counts.set(visit.patientId, (counts.get(visit.patientId) ?? 0) + 1);
    });
    return counts;
  }, [records.visits]);

  // Пациенты врача в том же порядке, что в прототипе: сначала те, у кого
  // назначен ближайший приём (по дате), затем по алфавиту. Фильтра по поиску
  // здесь нет намеренно: поиск живёт внутри выпадающего списка, иначе
  // набранный в поиске текст решал бы ещё и то, какого пациента показать
  // в форме, — стоило не найти совпадения, и форма пустела.
  const doctorPatients = useMemo(() => {
    if (!doctor) return [];
    return records.patients
      .filter((patient) => patient.doctorId === doctor.id)
      .sort((a, b) => {
        const aNextDate = nearestNextVisitByPatient.get(a.id) ?? "";
        const bNextDate = nearestNextVisitByPatient.get(b.id) ?? "";
        if (aNextDate && bNextDate && aNextDate !== bNextDate) {
          return aNextDate.localeCompare(bNextDate);
        }
        if (aNextDate && !bNextDate) return -1;
        if (!aNextDate && bNextDate) return 1;
        return `${a.lastName} ${a.firstName} ${a.middleName}`.localeCompare(
          `${b.lastName} ${b.firstName} ${b.middleName}`,
          "ru",
        );
      });
  }, [doctor, nearestNextVisitByPatient, records.patients]);

  const organizations = useMemo(
    () =>
      Array.from(
        new Set(doctors.map((item) => item.organization.trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "ru")),
    [doctors],
  );

  const activeOrganization = selectedOrganization || doctor?.organization || organizations[0] || "";

  const doctorsInSelectedOrganization = useMemo(
    () =>
      doctors
        .filter((item) => item.organization.trim() === activeOrganization)
        .sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [activeOrganization, doctors],
  );

  const selectedPatient =
    records.patients.find((patient) => patient.id === selectedPatientId) ?? doctorPatients[0];

  const patientVisits = useMemo(() => {
    if (!selectedPatient) return [];
    return records.visits
      .filter((visit) => visit.patientId === selectedPatient.id)
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  }, [records.visits, selectedPatient]);

  const selectedVisit =
    records.visits.find((visit) => visit.id === selectedVisitId) ?? patientVisits[0];

  /**
   * Выделенная строка графика. По умолчанию — самый свежий СВОЙ приём, отличный
   * от открытого: сценарий «пациент пришёл снова» начинается именно с него, и
   * «Копировать протокол» работает с первого клика.
   *
   * Именно свой: если последним в списке окажется приём другого врача, кнопка
   * копирования окажется заблокированной на пустом месте — врач увидит серую
   * кнопку и не поймёт почему.
   */
  const scheduleSelectedId = patientVisits.some((visit) => visit.id === scheduleSelectionId)
    ? scheduleSelectionId
    : patientVisits.find((visit) => visit.id !== selectedVisitId && visit.doctorId === doctor?.id)
        ?.id ?? "";

  const selectedPrintTemplate =
    printTemplates.find((template) => template.id === selectedPrintTemplateId) ??
    printTemplates[0] ??
    defaultPrintTemplates[0];

  const activeSection = activeSuggestionTarget?.label ?? "";

  const activeEntries = useMemo(
    () => dictionaryEntries.filter((entry) => entry.section === activeSection),
    [dictionaryEntries, activeSection],
  );

  /** Тексты раздела — для проверки дублей и вставки в поле. */
  const activeSuggestions = useMemo(
    () => suggestionTextsFor(dictionaryEntries, activeSection),
    [dictionaryEntries, activeSection],
  );

  /**
   * Единая точка изменения справочников.
   *
   * Пишем в localStorage сразу, а на сервер — «выстрелил и забыл»: программа
   * должна работать и без него, а следующая загрузка сведёт обе стороны.
   */
  const mutateDictionaries = (updater: (current: DictionaryEntry[]) => DictionaryEntry[]) => {
    const next = sortEntries(updater(dictionaryRef.current));
    dictionaryRef.current = next;
    setDictionaryEntries(next);
    saveDictionaries(next);
    return next;
  };

  const persistDictionaryEntry = (entry: DictionaryEntry) => {
    mutateDictionaries((current) =>
      current.some((item) => item.id === entry.id)
        ? current.map((item) => (item.id === entry.id ? entry : item))
        : [...current, entry],
    );
    apiSaveDictionaryEntry(entry).catch(() => undefined);
  };

  const removeDictionaryEntry = (id: string) => {
    mutateDictionaries((current) => current.filter((entry) => entry.id !== id));
    apiDeleteDictionaryEntry(id).catch(() => undefined);
  };

  /** Порядковый номер для новой записи в конце раздела. */
  const nextOrderInSection = (section: string) =>
    dictionaryEntries
      .filter((entry) => entry.section === section)
      .reduce((max, entry) => Math.max(max, entry.order + 1), 0);

  /**
   * Групповая вставка из буфера.
   *
   * Сначала пробуем сервер: он сам выдаёт идентификаторы и возвращает готовый
   * список, поэтому локальные записи не приходится потом сверять с серверными.
   * Если сервер недоступен — остаёмся на локальных, чтобы работа не пропала.
   */
  const importDictionaryEntries = async (
    section: string,
    items: Array<{ short: string; full: string }>,
  ) => {
    const baseOrder = nextOrderInSection(section);
    const payload = items.map((item, index) => ({
      section,
      short: item.short,
      full: item.full,
      color: "",
      parentId: "",
      order: baseOrder + index,
    }));

    try {
      const serverEntries = await apiImportDictionaryEntries(payload);
      mergeServerDictionaries(serverEntries as DictionaryEntry[]);
    } catch {
      mutateDictionaries((current) => [
        ...current,
        ...payload.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          scope: "personal" as DictionaryScope,
        })),
      ]);
    }

    toast({
      title: "Записи добавлены",
      description: `${items.length} шт. в разделе «${section}».`,
    });
    return items.length;
  };

  /**
   * Удаление из полного экрана. Для общей записи спрашиваем подтверждение:
   * она принадлежит всем врачам, и промах мышью не должен её стирать.
   */
  const deleteDictionaryEntry = (entry: DictionaryEntry) => {
    if (
      entry.scope === "global" &&
      !window.confirm("Удалить запись из общего справочника? Она исчезнет у всех врачей.")
    ) {
      return;
    }
    removeDictionaryEntry(entry.id);
  };

  /**
   * Открыть экран справочников на нужном разделе.
   *
   * Раздел берём тот, у которого врач вызвал подсказку. Если записей там нет,
   * открываем первый непустой: пустой список на входе читается как «справочник
   * пуст», хотя записи просто лежат в других разделах.
   */
  const openDictionaries = (preferredSection: string = activeSection) => {
    const preferred = preferredSection || dictionarySections[0] || "";
    const hasPreferred = dictionaryEntries.some(
      (entry) => entry.section === preferred && entry.scope === "personal",
    );
    const fallback = dictionaryEntries.find((entry) => entry.scope === "personal")?.section;
    setDictionarySection(hasPreferred ? preferred : fallback ?? preferred);
    setDictionariesOpen(true);
  };

  const activateSuggestionTarget = (target: SuggestionTarget) => {
    setActiveSuggestionTarget(target);
    setSuggestionPhrase("");
  };

  const addActiveSuggestion = () => {
    if (!activeSuggestionTarget) return;
    const nextPhrase = suggestionPhrase.trim();
    if (!nextPhrase || activeSuggestions.includes(nextPhrase)) return;

    persistDictionaryEntry({
      id: crypto.randomUUID(),
      section: activeSuggestionTarget.label,
      short: nextPhrase,
      full: "",
      color: "",
      parentId: "",
      order: nextOrderInSection(activeSuggestionTarget.label),
      scope: "personal",
    });
    setSuggestionPhrase("");
  };

  /**
   * Удаление из панели. Общую запись так не убрать: она принадлежит всем
   * врачам, и один щелчок в узкой панели — слишком дешёвый способ стереть
   * её у коллег. Общие правятся на экране «Справочники».
   */
  const deleteActiveSuggestion = (suggestion: string) => {
    if (!activeSuggestionTarget) return;
    const own = activeEntries.find(
      (entry) => entry.scope === "personal" && entry.short === suggestion,
    );
    if (!own) return;
    removeDictionaryEntry(own.id);
  };

  const updateDraftRecords = (nextRecords: MedicalRecords) => {
    recordsRef.current = nextRecords;
    setRecords(nextRecords);
    setHasUnsavedChanges(true);
  };

  const persistRecords = () => {
    const currentRecords = recordsRef.current;
    const preferredVisitId = currentRecords.visits.some((visit) => visit.id === selectedVisitId)
      ? selectedVisitId
      : selectedVisit?.id ?? selectedVisitId;
    const normalizedRecords = {
      ...currentRecords,
      visits: mergeVisitsByPatientAndDate(currentRecords.visits, preferredVisitId),
    };
    recordsRef.current = normalizedRecords;
    setRecords(normalizedRecords);
    localStorage.setItem(storageKey, JSON.stringify(normalizedRecords));
    setHasUnsavedChanges(false);
    return normalizedRecords;
  };

  const resetDraftRecords = () => {
    const savedRecords = loadRecords();
    recordsRef.current = savedRecords;
    setRecords(savedRecords);
    setHasUnsavedChanges(false);
    return savedRecords;
  };

  const requestProtectedAction = (action: (sourceRecords: MedicalRecords) => void) => {
    if (!hasUnsavedChanges) {
      action(recordsRef.current);
      return;
    }

    pendingActionRef.current = action;
    setLeaveDialogOpen(true);
  };

  const runPendingAction = (sourceRecords: MedicalRecords) => {
    if (pendingActionRef.current) {
      pendingActionRef.current(sourceRecords);
      pendingActionRef.current = null;
      return;
    }

  };

  const saveAndContinue = async () => {
    const savedRecords = persistRecords();
    try {
      const serverRecords = await apiSaveRecords(savedRecords);
      recordsRef.current = serverRecords as MedicalRecords;
      setRecords(serverRecords as MedicalRecords);
    } catch {
      // Local demo mode still keeps records in localStorage.
    }
    setLeaveDialogOpen(false);
    runPendingAction(recordsRef.current);
  };

  const discardAndContinue = () => {
    const savedRecords = resetDraftRecords();
    setLeaveDialogOpen(false);
    if (pendingActionRef.current) {
      pendingActionRef.current(savedRecords);
      pendingActionRef.current = null;
      return;
    }

    if (doctor) {
      const firstPatient = savedRecords.patients.find((patient) => patient.doctorId === doctor.id);
      setSelectedPatientId(firstPatient?.id ?? "");
      setSelectedVisitId(
        savedRecords.visits.find((visit) => visit.patientId === firstPatient?.id)?.id ?? "",
      );
    }

  };

  const stayOnPage = () => {
    pendingActionRef.current = null;
    setLeaveDialogOpen(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!hasUnsavedChanges || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link?.href || link.target === "_blank" || link.href === window.location.href) return;

      event.preventDefault();
      requestProtectedAction(() => {
        window.location.href = link.href;
      });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [hasUnsavedChanges]);

  const updatePatient = (field: keyof Patient, value: string) => {
    if (!selectedPatient) return;
    const currentRecords = recordsRef.current;
    updateDraftRecords({
      ...currentRecords,
      patients: currentRecords.patients.map((patient) =>
        patient.id === selectedPatient.id ? { ...patient, [field]: value } : patient,
      ),
    });
  };

  const updateVisit = (field: keyof Visit, value: string) => {
    if (!selectedVisit) return;
    const currentRecords = recordsRef.current;
    const currentVisit =
      currentRecords.visits.find((visit) => visit.id === selectedVisit.id) ?? selectedVisit;
    const nextVisit = { ...currentVisit, [field]: value };
    if (field === "recordDate" && selectedPatient) {
      nextVisit.ageAtVisit = getAgeAtDate(selectedPatient.birthDate, value);
    }
    updateDraftRecords({
      ...currentRecords,
      visits: currentRecords.visits.map((visit) =>
        visit.id === currentVisit.id ? nextVisit : visit,
      ),
    });
  };

  const handleLogin = async () => {
    let availableDoctors = loadDoctorUsers();
    let foundDoctor: DoctorUser | undefined;

    try {
      const session = await apiLogin(login.trim(), password.trim());
      if (session.role !== "doctor") {
        toast({ title: "Вход не выполнен", description: "Для базы приемов нужен логин врача." });
        return;
      }
      const [serverDoctors, serverRecords, serverDictionary] = await Promise.all([
        apiGetDoctors(),
        apiGetRecords(),
        apiGetDictionaries(),
      ]);
      availableDoctors = serverDoctors;
      foundDoctor = availableDoctors.find((item) => item.id === session.doctorId);
      recordsRef.current = serverRecords as MedicalRecords;
      setRecords(serverRecords as MedicalRecords);
      if (Array.isArray(serverDictionary)) {
        mergeServerDictionaries(serverDictionary as DictionaryEntry[]);
      }
      saveAuthSession(session);
    } catch (error) {
      if (!isApiUnavailable(error)) {
        toast({ title: "Вход не выполнен", description: "Проверьте логин и пароль врача." });
        return;
      }

      foundDoctor = availableDoctors.find(
        (item) => item.login === login.trim() && item.password === password.trim(),
      );
    }

    setDoctors(availableDoctors);
    if (!foundDoctor) {
      toast({ title: "Вход не выполнен", description: "Проверьте логин и пароль врача." });
      return;
    }

    const currentRecords = recordsRef.current;
    const firstPatient = currentRecords.patients.find((patient) => patient.doctorId === foundDoctor.id);
    saveAuthSession({ role: "doctor", doctorId: foundDoctor.id });
    setDoctor(foundDoctor);
    setSelectedOrganization(foundDoctor.organization);
    setSelectedPatientId(firstPatient?.id ?? "");
    setSelectedVisitId(currentRecords.visits.find((visit) => visit.patientId === firstPatient?.id)?.id ?? "");
  };

  const selectDoctor = (
    nextDoctor: DoctorUser,
    sourceRecords: { patients: Patient[]; visits: Visit[] } = records,
  ) => {
    const firstPatient = sourceRecords.patients.find((patient) => patient.doctorId === nextDoctor.id);
    setDoctor(nextDoctor);
    setSelectedOrganization(nextDoctor.organization);
    setSelectedPatientId(firstPatient?.id ?? "");
    setSelectedVisitId(
      sourceRecords.visits.find((visit) => visit.patientId === firstPatient?.id)?.id ?? "",
    );
  };

  const selectOrganization = (
    organization: string,
    sourceRecords: { patients: Patient[]; visits: Visit[] } = records,
  ) => {
    const firstDoctor = doctors
      .filter((item) => item.organization.trim() === organization)
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))[0];

    setSelectedOrganization(organization);
    if (firstDoctor) {
      selectDoctor(firstDoctor, sourceRecords);
      return;
    }

    setDoctor(null);
    setSelectedPatientId("");
    setSelectedVisitId("");
  };

  const selectPatient = (
    patientId: string,
    sourceRecords: { patients: Patient[]; visits: Visit[] } = records,
  ) => {
    setSelectedPatientId(patientId);
    setSelectedVisitId(
      sourceRecords.visits
        .filter((visit) => visit.patientId === patientId)
        .sort((a, b) => b.recordDate.localeCompare(a.recordDate))[0]?.id ?? "",
    );
  };

  const selectVisit = (visitId: string) => {
    setSelectedVisitId(visitId);
  };

  const getNextConsultationType = (patientId: string, sourceRecords = records) => {
    const hasPreviousVisits = sourceRecords.visits.some((visit) => visit.patientId === patientId);
    return hasPreviousVisits ? followUpConsultationType : primaryConsultationType;
  };

  const addPatient = () => {
    if (!doctor) return;
    const currentRecords = recordsRef.current;
    const patient: Patient = {
      id: crypto.randomUUID(),
      doctorId: doctor.id,
      lastName: "Новый",
      firstName: "Пациент",
      middleName: "",
      birthDate: "",
      phone: "",
      address: "",
    };
    const visit = {
      ...emptyVisit(doctor, patient.id),
      consultationType: primaryConsultationType,
    };
    updateDraftRecords({
      patients: [...currentRecords.patients, patient],
      visits: [...currentRecords.visits, visit],
    });
    setSelectedPatientId(patient.id);
    setSelectedVisitId(visit.id);
  };

  const addVisit = () => {
    if (!doctor || !selectedPatient) return;
    const currentRecords = recordsRef.current;
    const today = new Date().toISOString().slice(0, 10);
    const existingVisitToday = currentRecords.visits.find(
      (visit) => visit.patientId === selectedPatient.id && visit.recordDate === today,
    );
    if (existingVisitToday) {
      setSelectedVisitId(existingVisitToday.id);
      toast({ title: "Прием уже есть", description: "Открыт прием пациента за сегодняшнюю дату." });
      return;
    }

    const visit = {
      ...emptyVisit(doctor, selectedPatient.id),
      recordDate: today,
      recordTime: currentTime(),
      consultationType: getNextConsultationType(selectedPatient.id, currentRecords),
      ageAtVisit: getAgeAtDate(selectedPatient.birthDate, today),
    };
    updateDraftRecords({ ...currentRecords, visits: [...currentRecords.visits, visit] });
    setSelectedVisitId(visit.id);
  };

  const copyVisit = () => {
    if (!selectedVisit) return;
    const currentRecords = recordsRef.current;
    const currentVisit =
      currentRecords.visits.find((visit) => visit.id === selectedVisit.id) ?? selectedVisit;
    const visit = {
      ...currentVisit,
      id: crypto.randomUUID(),
      recordDate: new Date().toISOString().slice(0, 10),
      recordTime: currentTime(),
      consultationType: getNextConsultationType(currentVisit.patientId, currentRecords),
      nextVisitDate: "",
      doctorComment: "",
    };
    updateDraftRecords({ ...currentRecords, visits: [...currentRecords.visits, visit] });
    setSelectedVisitId(visit.id);
  };

  /**
   * Копирование протокола из графика. По требованию доктора это НИКОГДА не
   * запись поверх: создаётся новый приём с полями выбранного, и уже он
   * дополняется после осмотра. Поэтому подтверждение не спрашиваем — затирать
   * нечего, а старый приём остаётся в истории нетронутым.
   */
  const copyProtocolFromVisit = (visitId: string) => {
    if (!doctor) return;
    const currentRecords = recordsRef.current;
    const source = currentRecords.visits.find((visit) => visit.id === visitId);
    if (!source) return;
    if (source.doctorId !== doctor.id) {
      toast({
        title: "Приём другого врача",
        description: "Скопировать протокол может только врач, который его вёл.",
        variant: "destructive",
      });
      return;
    }

    const visit = {
      ...source,
      id: crypto.randomUUID(),
      recordDate: new Date().toISOString().slice(0, 10),
      recordTime: currentTime(),
      consultationType: getNextConsultationType(source.patientId, currentRecords),
      nextVisitDate: "",
      doctorComment: "",
    };
    updateDraftRecords({ ...currentRecords, visits: [...currentRecords.visits, visit] });
    setSelectedVisitId(visit.id);
    toast({
      title: "Протокол скопирован",
      description: "Создан новый приём. Дополните его после осмотра.",
    });
  };

  const saveRecords = async () => {
    const savedRecords = persistRecords();
    try {
      const serverRecords = await apiSaveRecords(savedRecords);
      recordsRef.current = serverRecords as MedicalRecords;
      setRecords(serverRecords as MedicalRecords);
      toast({ title: "Запись сохранена", description: "Данные приема обновлены на сервере." });
      return;
    } catch (error) {
      if (!isApiUnavailable(error)) {
        toast({ title: "Сервер недоступен", description: "Данные сохранены локально. Повторите сохранение позже." });
        return;
      }
    }

    toast({ title: "Запись сохранена", description: "Данные приема обновлены в демо-базе." });
  };

  const persistPrintTemplates = (nextTemplates: PrintTemplate[]) => {
    setPrintTemplates(nextTemplates);
    savePrintTemplates(nextTemplates);
  };

  const updatePrintTemplate = (templateId: string, patch: Partial<PrintTemplate>) => {
    persistPrintTemplates(
      printTemplates.map((template) =>
        template.id === templateId ? { ...template, ...patch } : template,
      ),
    );
  };

  const addPrintTemplate = () => {
    const template: PrintTemplate = {
      id: crypto.randomUUID(),
      name: `Новый шаблон ${printTemplates.length + 1}`,
      intro: "",
      fieldKeys: ["patient.fullName", "visit.recordDate", "visit.doctorName"],
      outro: "",
    };
    persistPrintTemplates([...printTemplates, template]);
    setSelectedPrintTemplateId(template.id);
    setTemplateSettingsOpen(true);
  };

  const deletePrintTemplate = (templateId: string) => {
    if (printTemplates.length <= 1) {
      toast({ title: "Нельзя удалить", description: "Должен остаться хотя бы один шаблон." });
      return;
    }
    const nextTemplates = printTemplates.filter((template) => template.id !== templateId);
    persistPrintTemplates(nextTemplates);
    setSelectedPrintTemplateId(nextTemplates[0]?.id ?? defaultPrintTemplates[0].id);
  };

  const togglePrintField = (template: PrintTemplate, fieldKey: string) => {
    const nextFieldKeys = template.fieldKeys.includes(fieldKey)
      ? template.fieldKeys.filter((key) => key !== fieldKey)
      : [...template.fieldKeys, fieldKey];
    updatePrintTemplate(template.id, { fieldKeys: nextFieldKeys });
  };

  const printRecord = () => {
    setTimeout(() => window.print(), 50);
  };

  const renderWordHtml = (template: PrintTemplate, patient: Patient, visit: Visit) => {
    const selectedFields = template.fieldKeys
      .map((fieldKey) => printFields.find((field) => field.key === fieldKey))
      .filter(Boolean) as PrintField[];

    const fieldRows = selectedFields
      .map((field) => {
        const value = getPrintFieldValue(field, patient, visit);
        if (!value) return "";
        return `<p><strong>${escapeHtml(field.label)}:</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(template.name)}</title>
  <style>
    body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.35; }
    h1 { font-size: 18pt; margin: 0 0 12pt; }
    h2 { font-size: 14pt; margin: 0 0 12pt; }
    p { margin: 0 0 10pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(template.name)}</h1>
  <h2>${escapeHtml(getPatientFullName(patient))}</h2>
  ${template.intro ? `<p>${escapeHtml(template.intro).replace(/\n/g, "<br>")}</p>` : ""}
  ${fieldRows}
  ${template.outro ? `<p>${escapeHtml(template.outro).replace(/\n/g, "<br>")}</p>` : ""}
</body>
</html>`;
  };

  const downloadWordFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportWordFile = async () => {
    if (!selectedPatient || !selectedVisit) return;
    const html = renderWordHtml(selectedPrintTemplate, selectedPatient, selectedVisit);
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const fileName = `${getPatientFullName(selectedPatient) || "patient"}_${selectedVisit.recordDate || "record"}.doc`.replace(/[\\/:*?"<>|]+/g, "_");
    const saveFilePicker = (window as WindowWithSaveFilePicker).showSaveFilePicker;

    if (saveFilePicker) {
      try {
        const handle = await saveFilePicker({
          id: "clinicbase-word-export",
          suggestedName: fileName,
          types: [
            {
              description: "Microsoft Word",
              accept: {
                "application/msword": [".doc"],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({ title: "Файл сохранен", description: "Документ Word выгружен в выбранную папку." });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast({ title: "Не удалось открыть выбор папки", description: "Файл будет сохранен как обычная загрузка." });
      }
    }

    downloadWordFile(blob, fileName);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-section-bg">
        <ClinicBaseHeader />
        <main className="container py-8 md:py-12">
          <section className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">База приемов</h1>
                <p className="text-sm text-muted-foreground">Вход для врача</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field stacked onActivateSuggestions={activateSuggestionTarget} label="Логин" value={login} onChange={setLogin} />
              <Field stacked onActivateSuggestions={activateSuggestionTarget} label="Пароль" type="password" value={password} onChange={setPassword} />
              <Button className="w-full" onClick={handleLogin}>
                Войти
              </Button>
              <p className="text-xs text-muted-foreground">
                Демо: fedorov / 1234, ivanova / 1234
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9edf2]">
      <ClinicBaseHeader compact />
      {/* Ширина не ограничена контейнером: в прототипе это окно программы на
          весь экран, а `container` держал 1280 px — на 1920 px треть ширины
          пустовала, а форма всё равно уезжала на четыре экрана вниз. */}
      <main className="w-full px-2 py-1.5">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm border border-[#c6ced9] bg-[#dfe4ea] px-2 py-1">
          <h1 className="text-[13px] font-semibold text-foreground">База приёмов</h1>
          {/* Фамилию врача не дублируем: она видна в селекте «Врач» рядом. */}
          <p className="text-[11px] text-muted-foreground">{doctor.speciality}</p>
          {hasUnsavedChanges && (
            <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
              есть несохранённые изменения
            </span>
          )}

          {/* Организация и врач — это контекст всего экрана, а не фильтр списка
              пациентов. В колонке они занимали верхние ~90 px, которые нужнее
              самим пациентам: в панели они стоят в одну строку и не стоят
              ничего по высоте. Подписи — строчные, слева от поля: надпись над
              полем в панели растянула бы её на две строки. */}
          <div className="flex items-center gap-1">
            <Label
              htmlFor="organization-select"
              className="text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              Организация
            </Label>
            <select
              id="organization-select"
              required
              className="h-6 max-w-[150px] rounded-sm border border-[#c6ced9] bg-white px-1 text-[11px]"
              value={activeOrganization}
              onChange={(event) => {
                requestProtectedAction((sourceRecords) =>
                  selectOrganization(event.target.value, sourceRecords),
                );
              }}
            >
              {organizations.map((organization) => (
                <option key={organization} value={organization}>
                  {organization}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Label htmlFor="doctor-select" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Врач
            </Label>
            <select
              id="doctor-select"
              className="h-6 max-w-[150px] rounded-sm border border-[#c6ced9] bg-white px-1 text-[11px]"
              value={doctor.id}
              onChange={(event) => {
                const nextDoctor = doctors.find((item) => item.id === event.target.value) ?? doctor;
                requestProtectedAction((sourceRecords) => selectDoctor(nextDoctor, sourceRecords));
              }}
            >
              {doctorsInSelectedOrganization.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Пациент — тоже контекст экрана, а не отдельная колонка: выбрал
              один раз и весь приём работаешь в форме. Кнопки «Пациент» и
              «Приём» стоят справа от селектора, потому что действуют на того,
              кто в нём выбран. */}
          <PatientPicker
            patients={doctorPatients}
            selectedPatientId={selectedPatient?.id ?? ""}
            visitCountByPatient={visitCountByPatient}
            nearestNextVisitByPatient={nearestNextVisitByPatient}
            onSelect={(patientId) => {
              requestProtectedAction((sourceRecords) => selectPatient(patientId, sourceRecords));
            }}
          />

          <div className="ml-auto flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDictionaries()}
              className="h-6 px-2 text-[11px]"
              data-testid="dictionaries-button"
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Справочники
            </Button>
            <Button variant="outline" size="sm" onClick={addPatient} className="h-6 px-2 text-[11px]">
              <Plus className="mr-1 h-3 w-3" />
              Пациент
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={addVisit}
              disabled={!selectedPatient}
              className="h-6 px-2 text-[11px]"
            >
              <CalendarDays className="mr-1 h-3 w-3" />
              Приём
            </Button>
          </div>
        </div>

        {/* Панель подсказок стоит на месте всегда, а не появляется при клике в
            поле. Иначе при каждом фокусе форма переезжала: колонка то
            появлялась, то исчезала, и текст под курсором сдвигался.

            Колонки пациентов здесь больше нет: выбор пациента переехал
            в выпадающий список верхней панели. Освободившиеся 248 px отданы
            полям истории болезни — ради них экран и открывают. */}
        <div
          className="grid gap-1.5 xl:grid-cols-[minmax(0,1fr)_6px_var(--panel-w)]"
          style={{ "--panel-w": `${panelWidthPx}px` } as CSSProperties}
        >

          <section
            data-testid="record-form"
            className="min-w-0 rounded-sm border border-[#c6ced9] bg-white"
          >
            {selectedPatient && selectedVisit ? (
              <>
                <div className="border-b border-[#c6ced9] bg-[#eef1f5] px-1.5 py-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-secondary/10 text-secondary">
                        <UserRound className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h2 className="text-[13px] font-semibold leading-tight">
                          {selectedPatient.lastName} {selectedPatient.firstName}{" "}
                          {selectedPatient.middleName}
                        </h2>
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {formatDateRu(selectedVisit.recordDate)}
                          {selectedVisit.recordTime ? ` · ${selectedVisit.recordTime}` : ""} ·{" "}
                          {selectedVisit.consultationType}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <select
                        className="h-6 rounded-sm border border-[#c6ced9] bg-white px-1 text-[11px]"
                        value={selectedVisitId}
                        onChange={(event) => setSelectedVisitId(event.target.value)}
                        aria-label="Приём"
                      >
                        {patientVisits.map((visit) => (
                          <option key={visit.id} value={visit.id}>
                            {formatDateRu(visit.recordDate)}
                            {visit.recordTime ? ` ${visit.recordTime}` : ""} · {visit.consultationType}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyVisit}
                        className="h-6 px-2 text-[11px]"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Копировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrintDialogOpen(true)}
                        className="h-6 px-2 text-[11px]"
                      >
                        <Printer className="mr-1 h-3 w-3" />
                        Печать
                      </Button>
                      <Button size="sm" onClick={saveRecords} className="h-6 px-2 text-[11px]">
                        <Save className="mr-1 h-3 w-3" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 p-1">
                  <RecordSection title="Пациент">
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Фамилия" value={selectedPatient.lastName} onChange={(value) => updatePatient("lastName", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Имя" value={selectedPatient.firstName} onChange={(value) => updatePatient("firstName", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Отчество" value={selectedPatient.middleName} onChange={(value) => updatePatient("middleName", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Дата рождения" type="date" value={selectedPatient.birthDate} onChange={(value) => updatePatient("birthDate", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Телефон" value={selectedPatient.phone} onChange={(value) => updatePatient("phone", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Дата записи" type="date" value={selectedVisit.recordDate} onChange={(value) => updateVisit("recordDate", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Время приёма" type="time" value={selectedVisit.recordTime} onChange={(value) => updateVisit("recordTime", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Полных лет" value={selectedVisit.ageAtVisit || getAgeAtDate(selectedPatient.birthDate, selectedVisit.recordDate)} onChange={(value) => updateVisit("ageAtVisit", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Адрес" value={selectedPatient.address} onChange={(value) => updatePatient("address", value)} />
                  </RecordSection>

                  <RecordSection title="Осмотр">
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Врач" value={selectedVisit.doctorName} onChange={(value) => updateVisit("doctorName", value)} />
                    <div className={rowClass}>
                      <Label htmlFor="consultation-type" className={labelCellClass}>
                        Консультация врача
                      </Label>
                      <select
                        id="consultation-type"
                        className={`h-7 ${valueCellClass}`}
                        value={selectedVisit.consultationType}
                        onChange={(event) => updateVisit("consultationType", event.target.value)}
                      >
                        {consultationTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Жалобы" value={selectedVisit.complaints} onChange={(value) => updateVisit("complaints", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Анамнез заболевания" value={selectedVisit.diseaseHistory} onChange={(value) => updateVisit("diseaseHistory", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Наследственность по основному заболеванию" value={selectedVisit.heredity} onChange={(value) => updateVisit("heredity", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Перенесенные заболевания" value={selectedVisit.pastDiseases} onChange={(value) => updateVisit("pastDiseases", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Перенесенные операции" value={selectedVisit.pastOperations} onChange={(value) => updateVisit("pastOperations", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Аллергии" value={selectedVisit.allergies} onChange={(value) => updateVisit("allergies", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Общий осмотр" value={selectedVisit.generalExam} onChange={(value) => updateVisit("generalExam", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Локальный осмотр" value={selectedVisit.localExam} onChange={(value) => updateVisit("localExam", value)} />
                  </RecordSection>

                  <RecordSection title="УЗИ">
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Врач" value={selectedVisit.ultrasoundDoctor} onChange={(value) => updateVisit("ultrasoundDoctor", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Консультация врача" value={selectedVisit.ultrasoundConsultationType} onChange={(value) => updateVisit("ultrasoundConsultationType", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Аппарат" value={selectedVisit.ultrasoundDevice} onChange={(value) => updateVisit("ultrasoundDevice", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Глубокие вены правая нижняя конечность" value={selectedVisit.deepVeinsRight} onChange={(value) => updateVisit("deepVeinsRight", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Глубокие вены левая нижняя конечность" value={selectedVisit.deepVeinsLeft} onChange={(value) => updateVisit("deepVeinsLeft", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Правая нижняя конечность: бассейн БПВ" value={selectedVisit.surfaceVeinsRightGsv} onChange={(value) => updateVisit("surfaceVeinsRightGsv", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Правая нижняя конечность: бассейн МПВ" value={selectedVisit.surfaceVeinsRightSsv} onChange={(value) => updateVisit("surfaceVeinsRightSsv", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Левая нижняя конечность: бассейн БПВ" value={selectedVisit.surfaceVeinsLeftGsv} onChange={(value) => updateVisit("surfaceVeinsLeftGsv", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Левая нижняя конечность: бассейн МПВ" value={selectedVisit.surfaceVeinsLeftSsv} onChange={(value) => updateVisit("surfaceVeinsLeftSsv", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Несостоятельные перфоранты" value={selectedVisit.perforators} onChange={(value) => updateVisit("perforators", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Отек/лимфостаз" value={selectedVisit.edema} onChange={(value) => updateVisit("edema", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Заключение" value={selectedVisit.ultrasoundConclusion} onChange={(value) => updateVisit("ultrasoundConclusion", value)} />
                  </RecordSection>

                  <RecordSection title="Диагноз">
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Основное заболевание" value={selectedVisit.diagnosisMain} onChange={(value) => updateVisit("diagnosisMain", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Код МКБ" value={selectedVisit.diagnosisCode} onChange={(value) => updateVisit("diagnosisCode", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Сопутствующие заболевания" value={selectedVisit.diagnosisComorbidities} onChange={(value) => updateVisit("diagnosisComorbidities", value)} />
                  </RecordSection>

                  <RecordSection title="Назначения и рекомендации">
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Режим" value={selectedVisit.regimen} onChange={(value) => updateVisit("regimen", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Медикаментозная терапия" value={selectedVisit.medicationTherapy} onChange={(value) => updateVisit("medicationTherapy", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Немедикаментозная терапия, рекомендованные манипуляции" value={selectedVisit.nonMedicationTherapy} onChange={(value) => updateVisit("nonMedicationTherapy", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Консультации специалистов" value={selectedVisit.specialistConsultations} onChange={(value) => updateVisit("specialistConsultations", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="План обследования" value={selectedVisit.examinationPlan} onChange={(value) => updateVisit("examinationPlan", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Рекомендации" value={selectedVisit.recommendations} onChange={(value) => updateVisit("recommendations", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Дата следующего визита" type="date" value={selectedVisit.nextVisitDate} onChange={(value) => updateVisit("nextVisitDate", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Комментарии доктора" value={selectedVisit.doctorComment} onChange={(value) => updateVisit("doctorComment", value)} />
                  </RecordSection>

                  <RecordSection title="Манипуляции">
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Название и локализация" value={selectedVisit.manipulationName} onChange={(value) => updateVisit("manipulationName", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Выполнено" value={selectedVisit.manipulationDone} onChange={(value) => updateVisit("manipulationDone", value)} />
                    <Area onActivateSuggestions={activateSuggestionTarget} label="Результат" value={selectedVisit.manipulationResult} onChange={(value) => updateVisit("manipulationResult", value)} />
                  </RecordSection>

                  <RecordSection title="Печать" defaultOpen={false}>
                    <PrintRecord template={selectedPrintTemplate} patient={selectedPatient} visit={selectedVisit} />
                  </RecordSection>
                </div>
                <PrintRecord
                  template={selectedPrintTemplate}
                  patient={selectedPatient}
                  visit={selectedVisit}
                  className="screen-hidden-print-copy"
                />
              </>
            ) : selectedPatient ? (
              // Пациент выбран, но приёмов у него ещё нет — раньше на этом
              // месте стояло «Выберите или создайте пациента», хотя пациент
              // уже выбран. Теперь выбор идёт из выпадающего списка, и такое
              // сообщение читалось бы как сбой.
              //
              // Фамилию в текст не подставляем: «У пациента Кузнецов Андрей»
              // требует родительного падежа, а склонять ФИО кодом — отдельная
              // морфология. Имя и так видно в селекте рядом.
              <div className="p-8 text-center text-[12px] leading-relaxed text-muted-foreground">
                У этого пациента ещё нет приёмов.
                <br />
                Нажмите «Приём» в верхней панели, чтобы создать первый.
              </div>
            ) : (
              <div className="p-8 text-center text-[12px] text-muted-foreground">
                Выберите или создайте пациента.
              </div>
            )}
          </section>

          <PanelResizer width={panelWidthPx} onChange={setPanelWidth} />

          {/* Панель рендерится всегда, но в одном из двух режимов: справочники
              или график. Переключает врач кнопкой «Информация», а не фокус:
              иначе форма дёргалась бы на каждом клике в поле. */}
          {panelMode === "schedule" ? (
            <SchedulePanel
              visits={patientVisits}
              doctorId={doctor?.id ?? ""}
              selectedVisitId={scheduleSelectedId}
              onSelect={setScheduleSelectionId}
              onOpen={(visitId) => setSelectedVisitId(visitId)}
              onCopyProtocol={copyProtocolFromVisit}
              onToggleMode={() => setPanelMode("dictionary")}
            />
          ) : (
            <SuggestionPanel
              label={activeSection}
              entries={activeEntries}
              phrase={suggestionPhrase}
              onPhraseChange={setSuggestionPhrase}
              onAdd={addActiveSuggestion}
              onDelete={deleteActiveSuggestion}
              onPick={(value) => activeSuggestionTarget?.insert(value)}
              onClose={() => setActiveSuggestionTarget(null)}
              onToggleMode={() => setPanelMode("schedule")}
              onOpenDictionaries={() => openDictionaries()}
            />
          )}
        </div>
      </main>

      <DictionariesDialog
        open={dictionariesOpen}
        onOpenChange={setDictionariesOpen}
        entries={dictionaryEntries}
        initialSection={dictionarySection}
        onSave={persistDictionaryEntry}
        onDelete={deleteDictionaryEntry}
        onImport={importDictionaryEntries}
      />

      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Печать документа</DialogTitle>
            <DialogDescription>
              Выберите шаблон печатной формы, распечатайте документ или выгрузите его в файл Word.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && selectedVisit && (
            <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="print-template-select">Шаблон</Label>
                  <select
                    id="print-template-select"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={selectedPrintTemplate.id}
                    onChange={(event) => setSelectedPrintTemplateId(event.target.value)}
                  >
                    {printTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => setTemplateSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Настройка шаблонов
                  </Button>
                  <Button variant="outline" onClick={exportWordFile}>
                    <Download className="mr-2 h-4 w-4" />
                    Выгрузить в Word
                  </Button>
                  <Button
                    onClick={() => {
                      setPrintDialogOpen(false);
                      printRecord();
                    }}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Печать
                  </Button>
                </div>
              </div>
              <div className="max-h-[65vh] overflow-y-auto rounded-md border bg-white p-3">
                <PrintRecord template={selectedPrintTemplate} patient={selectedPatient} visit={selectedVisit} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={templateSettingsOpen} onOpenChange={setTemplateSettingsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Настройка шаблонов печати</DialogTitle>
            <DialogDescription>
              Создавайте шаблоны и отмечайте поля, которые должны попадать в печатную форму.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-3">
              <Button className="w-full" variant="outline" onClick={addPrintTemplate}>
                <Plus className="mr-2 h-4 w-4" />
                Новый шаблон
              </Button>
              <div className="max-h-[56vh] space-y-2 overflow-y-auto rounded-md border bg-[#f1f3f6] p-2">
                {printTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`flex items-center gap-2 rounded-md border p-2 ${
                      selectedPrintTemplate.id === template.id ? "border-primary bg-white" : "border-transparent bg-white/70"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                      onClick={() => setSelectedPrintTemplateId(template.id)}
                    >
                      {template.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => deletePrintTemplate(template.id)}
                      aria-label="Удалить шаблон"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </aside>

            <section className="max-h-[66vh] overflow-y-auto rounded-md border bg-[#f7f8fa] p-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="print-template-name">Название шаблона</Label>
                  <Input
                    id="print-template-name"
                    value={selectedPrintTemplate.name}
                    onChange={(event) =>
                      updatePrintTemplate(selectedPrintTemplate.id, { name: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="print-template-intro">Текст перед полями</Label>
                  <Textarea
                    id="print-template-intro"
                    className="min-h-20 bg-white"
                    value={selectedPrintTemplate.intro}
                    onChange={(event) =>
                      updatePrintTemplate(selectedPrintTemplate.id, { intro: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Поля шаблона</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {printFields.map((field) => (
                      <label
                        key={field.key}
                        className="flex cursor-pointer items-start gap-2 rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedPrintTemplate.fieldKeys.includes(field.key)}
                          onChange={() => togglePrintField(selectedPrintTemplate, field.key)}
                        />
                        <span>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="print-template-outro">Текст после полей</Label>
                  <Textarea
                    id="print-template-outro"
                    className="min-h-20 bg-white"
                    value={selectedPrintTemplate.outro}
                    onChange={(event) =>
                      updatePrintTemplate(selectedPrintTemplate.id, { outro: event.target.value })
                    }
                  />
                </div>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={leaveDialogOpen} onOpenChange={(open) => (!open ? stayOnPage() : setLeaveDialogOpen(true))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить изменения?</DialogTitle>
            <DialogDescription>
              В карточке приема есть внесенные изменения. Их можно сохранить перед выходом или
              продолжить без сохранения.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button variant="outline" onClick={stayOnPage}>
              Остаться
            </Button>
            <Button variant="outline" onClick={discardAndContinue}>
              Не сохранять
            </Button>
            <Button onClick={saveAndContinue}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDatabase;
