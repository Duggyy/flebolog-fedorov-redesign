import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
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
  apiGetDoctors,
  apiGetRecords,
  apiGetSession,
  apiGetSuggestions,
  apiLogin,
  apiSaveRecords,
  apiSaveSuggestions,
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

const emptyVisit = (doctor: DoctorUser, patientId: string): Visit => ({
  id: crypto.randomUUID(),
  patientId,
  doctorId: doctor.id,
  recordDate: new Date().toISOString().slice(0, 10),
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
];

const mergeVisitsByPatientAndDate = (visits: Visit[], preferredVisitId = "") => {
  const groupedVisits = new Map<string, Visit[]>();
  visits.forEach((visit) => {
    const key = `${visit.patientId}-${visit.recordDate}`;
    groupedVisits.set(key, [...(groupedVisits.get(key) ?? []), visit]);
  });

  const mergedVisits = Array.from(groupedVisits.values()).map((group) => {
    const preferredVisit = group.find((visit) => visit.id === preferredVisitId);
    const baseVisit = { ...(preferredVisit ?? group[group.length - 1]) };

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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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

const loadSuggestions = (label: string) => {
  const saved = localStorage.getItem(suggestionsStorageKey);
  const fallback = defaultSuggestions[label] ?? [];
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved) as Record<string, string[]>;
    return parsed[label] ?? fallback;
  } catch {
    return fallback;
  }
};

const loadAllSuggestions = () => {
  const saved = localStorage.getItem(suggestionsStorageKey);
  if (!saved) return defaultSuggestions;

  try {
    const parsed = JSON.parse(saved) as Record<string, string[]>;
    return { ...defaultSuggestions, ...parsed };
  } catch {
    return defaultSuggestions;
  }
};

const saveSuggestions = (label: string, suggestions: string[]) => {
  const saved = localStorage.getItem(suggestionsStorageKey);
  let parsed: Record<string, string[]> = {};
  if (saved) {
    try {
      parsed = JSON.parse(saved) as Record<string, string[]>;
    } catch {
      parsed = {};
    }
  }
  localStorage.setItem(suggestionsStorageKey, JSON.stringify({ ...parsed, [label]: suggestions }));
};

const persistSuggestions = (label: string, suggestions: string[]) => {
  saveSuggestions(label, suggestions);
  apiSaveSuggestions(label, suggestions).catch(() => undefined);
};

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

const SuggestionPanel = ({
  label,
  suggestions,
  phrase,
  onPhraseChange,
  onAdd,
  onDelete,
  onPick,
  onClose,
}: {
  label: string;
  suggestions: string[];
  phrase: string;
  onPhraseChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (value: string) => void;
  onPick: (value: string) => void;
  onClose: () => void;
}) => (
  <aside className="sticky top-4 flex max-h-[calc(100vh-2rem)] min-h-[520px] flex-col rounded-lg border bg-[#f1f3f6] shadow-sm">
    <div className="flex items-start justify-between gap-3 border-b bg-[#e5e8ed] p-3">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Подсказки</p>
        <h2 className="mt-1 text-base font-semibold leading-tight">{label}</h2>
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={onClose} aria-label="Закрыть подсказки">
        <X className="h-4 w-4" />
      </Button>
    </div>
    {suggestions.length > 0 ? (
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion} className="flex items-start gap-2 rounded-md border bg-white p-2 shadow-sm">
            <button
              type="button"
              className="min-w-0 flex-1 rounded-sm px-2 py-1 text-left text-sm leading-5 hover:bg-muted"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(suggestion)}
            >
              {suggestion}
            </button>
            <button
              type="button"
              className="rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onDelete(suggestion)}
              aria-label="Удалить подсказку"
            >
              x
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="flex-1 p-4 text-sm text-muted-foreground">Подсказок пока нет.</p>
    )}
    <div className="border-t bg-[#e5e8ed] p-3">
      <Label className="mb-1.5 block text-xs text-muted-foreground">Новая подсказка</Label>
      <div className="flex gap-2">
      <Input
        className="h-9 text-sm"
        value={phrase}
        placeholder="Новая подсказка"
        onChange={(event) => onPhraseChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAdd();
          }
        }}
      />
      <Button type="button" size="sm" variant="outline" onClick={onAdd}>
        Добавить
      </Button>
      </div>
    </div>
  </aside>
);

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  onActivateSuggestions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  onActivateSuggestions?: (target: SuggestionTarget) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
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
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        ref={inputRef}
        type={type}
        value={value}
        onFocus={activateSuggestions}
        onChange={(event) => onChange(event.target.value)}
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
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        className="min-h-10 resize-none overflow-hidden py-2 leading-5"
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
  <details className="rounded-md border bg-[#f7f8fa] shadow-sm" open={defaultOpen}>
    <summary className="cursor-pointer select-none rounded-t-md border-b bg-[#e5e8ed] px-3 py-2 text-sm font-semibold text-foreground marker:text-primary">
      {title}
    </summary>
    <div className="flex flex-col gap-3 p-3">{children}</div>
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
  const [search, setSearch] = useState("");
  const [printTemplates, setPrintTemplates] = useState(loadPrintTemplates);
  const [selectedPrintTemplateId, setSelectedPrintTemplateId] = useState(
    () => loadPrintTemplates()[0]?.id ?? defaultPrintTemplates[0].id,
  );
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [templateSettingsOpen, setTemplateSettingsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [expandedPatientIds, setExpandedPatientIds] = useState<string[]>([]);
  const [activeSuggestionTarget, setActiveSuggestionTarget] = useState<SuggestionTarget | null>(null);
  const [suggestionPhrase, setSuggestionPhrase] = useState("");
  const [suggestionsByLabel, setSuggestionsByLabel] = useState(loadAllSuggestions);
  const recordsRef = useRef(records);
  const pendingActionRef = useRef<((sourceRecords: MedicalRecords) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const localSession = loadAuthSession();
      let availableDoctors = loadDoctorUsers();
      let availableRecords = loadRecords();
      let activeSession = localSession;

      try {
        const [serverSession, serverDoctors, serverRecords, serverSuggestions] = await Promise.all([
          apiGetSession(),
          apiGetDoctors(),
          apiGetRecords(),
          apiGetSuggestions(),
        ]);
        activeSession = serverSession ?? localSession;
        availableDoctors = serverDoctors;
        availableRecords = serverRecords as MedicalRecords;
        if (!cancelled) {
          setSuggestionsByLabel({ ...defaultSuggestions, ...serverSuggestions });
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

  const visiblePatients = useMemo(() => {
    if (!doctor) return [];
    const query = search.trim().toLowerCase();
    return records.patients
      .filter((patient) => patient.doctorId === doctor.id)
      .filter((patient) =>
        `${patient.lastName} ${patient.firstName} ${patient.middleName} ${patient.phone}`
          .toLowerCase()
          .includes(query),
      )
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
  }, [doctor, nearestNextVisitByPatient, records.patients, search]);

  useEffect(() => {
    const scheduledPatientIds = visiblePatients
      .filter((patient) => nearestNextVisitByPatient.has(patient.id))
      .map((patient) => patient.id);
    if (scheduledPatientIds.length === 0) return;

    setExpandedPatientIds((currentIds) =>
      Array.from(new Set([...currentIds, ...scheduledPatientIds])).filter((patientId) =>
        visiblePatients.some((patient) => patient.id === patientId),
      ),
    );
  }, [nearestNextVisitByPatient, visiblePatients]);

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
    records.patients.find((patient) => patient.id === selectedPatientId) ?? visiblePatients[0];

  const patientVisits = useMemo(() => {
    if (!selectedPatient) return [];
    return records.visits
      .filter((visit) => visit.patientId === selectedPatient.id)
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  }, [records.visits, selectedPatient]);

  const selectedVisit =
    records.visits.find((visit) => visit.id === selectedVisitId) ?? patientVisits[0];

  const selectedPrintTemplate =
    printTemplates.find((template) => template.id === selectedPrintTemplateId) ??
    printTemplates[0] ??
    defaultPrintTemplates[0];

  const activeSuggestions = activeSuggestionTarget
    ? suggestionsByLabel[activeSuggestionTarget.label] ?? defaultSuggestions[activeSuggestionTarget.label] ?? []
    : [];

  const activateSuggestionTarget = (target: SuggestionTarget) => {
    setActiveSuggestionTarget(target);
    setSuggestionPhrase("");
  };

  const addActiveSuggestion = () => {
    if (!activeSuggestionTarget) return;
    const nextPhrase = suggestionPhrase.trim();
    if (!nextPhrase || activeSuggestions.includes(nextPhrase)) return;
    const nextSuggestions = [...activeSuggestions, nextPhrase];
    setSuggestionsByLabel((current) => ({ ...current, [activeSuggestionTarget.label]: nextSuggestions }));
    persistSuggestions(activeSuggestionTarget.label, nextSuggestions);
    setSuggestionPhrase("");
  };

  const deleteActiveSuggestion = (suggestion: string) => {
    if (!activeSuggestionTarget) return;
    const nextSuggestions = activeSuggestions.filter((item) => item !== suggestion);
    setSuggestionsByLabel((current) => ({ ...current, [activeSuggestionTarget.label]: nextSuggestions }));
    persistSuggestions(activeSuggestionTarget.label, nextSuggestions);
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
      const [serverDoctors, serverRecords, serverSuggestions] = await Promise.all([
        apiGetDoctors(),
        apiGetRecords(),
        apiGetSuggestions(),
      ]);
      availableDoctors = serverDoctors;
      foundDoctor = availableDoctors.find((item) => item.id === session.doctorId);
      recordsRef.current = serverRecords as MedicalRecords;
      setRecords(serverRecords as MedicalRecords);
      setSuggestionsByLabel({ ...defaultSuggestions, ...serverSuggestions });
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
    setExpandedPatientIds([]);
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
    setExpandedPatientIds([]);
  };

  const selectPatient = (
    patientId: string,
    sourceRecords: { patients: Patient[]; visits: Visit[] } = records,
  ) => {
    setSelectedPatientId(patientId);
    setExpandedPatientIds((currentIds) => currentIds.filter((id) => id !== patientId));
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
    setExpandedPatientIds([]);
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
      consultationType: getNextConsultationType(selectedPatient.id, currentRecords),
      ageAtVisit: getAgeAtDate(selectedPatient.birthDate, today),
    };
    updateDraftRecords({ ...currentRecords, visits: [...currentRecords.visits, visit] });
    setSelectedVisitId(visit.id);
    setExpandedPatientIds((currentIds) => Array.from(new Set([...currentIds, selectedPatient.id])));
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
      consultationType: getNextConsultationType(currentVisit.patientId, currentRecords),
      nextVisitDate: "",
      doctorComment: "",
    };
    updateDraftRecords({ ...currentRecords, visits: [...currentRecords.visits, visit] });
    setSelectedVisitId(visit.id);
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
        return `<p><strong>${escapeHtml(field.label)}:</strong><br>${escapeHtml(value).replaceAll("\n", "<br>")}</p>`;
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
  ${template.intro ? `<p>${escapeHtml(template.intro).replaceAll("\n", "<br>")}</p>` : ""}
  ${fieldRows}
  ${template.outro ? `<p>${escapeHtml(template.outro).replaceAll("\n", "<br>")}</p>` : ""}
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
              <Field onActivateSuggestions={activateSuggestionTarget} label="Логин" value={login} onChange={setLogin} />
              <Field onActivateSuggestions={activateSuggestionTarget} label="Пароль" type="password" value={password} onChange={setPassword} />
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
    <div className="min-h-screen bg-section-bg">
      <ClinicBaseHeader />
      <main className="container py-6">
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border bg-[#d8dde5] p-4 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold">База приемов</h1>
            <p className="text-sm text-muted-foreground">
              {doctor.name} · {doctor.speciality}
              {hasUnsavedChanges && (
                <span className="ml-2 rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  есть несохраненные изменения
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={addPatient}>
              <Plus className="mr-2 h-4 w-4" />
              Пациент
            </Button>
            <Button variant="outline" size="sm" onClick={addVisit} disabled={!selectedPatient}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Прием
            </Button>
          </div>
        </div>

        <div
          className={`grid gap-4 ${
            activeSuggestionTarget
              ? "lg:grid-cols-[320px_minmax(0,1fr)_minmax(240px,20vw)]"
              : "lg:grid-cols-[320px_minmax(0,1fr)]"
          }`}
        >
          <aside className="rounded-lg border bg-[#f1f3f6] shadow-sm">
            <div className="border-b bg-[#e5e8ed] p-4">
              <Label htmlFor="organization-select">Организация *</Label>
              <select
                id="organization-select"
                required
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
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

              <Label htmlFor="doctor-select">Врач</Label>
              <select
                id="doctor-select"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                value={doctor.id}
                onChange={(event) => {
                  const nextDoctor = doctors.find((item) => item.id === event.target.value) ?? doctor;
                  requestProtectedAction((sourceRecords) =>
                    selectDoctor(nextDoctor, sourceRecords),
                  );
                }}
              >
                {doctorsInSelectedOrganization.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Поиск пациента"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[620px] overflow-y-auto p-2">
              {visiblePatients.map((patient) => {
                const visitsForPatient = records.visits
                  .filter((visit) => visit.patientId === patient.id)
                  .sort((a, b) => b.recordDate.localeCompare(a.recordDate));
                const visitCount = visitsForPatient.length;
                const nearestNextVisitDate = nearestNextVisitByPatient.get(patient.id) ?? "";
                const isSelectedPatient = selectedPatient?.id === patient.id;
                const isExpandedPatient = expandedPatientIds.includes(patient.id);
                return (
                  <div key={patient.id} className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelectedPatient) {
                          setExpandedPatientIds((currentIds) =>
                            isExpandedPatient
                              ? currentIds.filter((id) => id !== patient.id)
                              : [...currentIds, patient.id],
                          );
                          return;
                        }
                        requestProtectedAction((sourceRecords) =>
                          selectPatient(patient.id, sourceRecords),
                        );
                      }}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        isSelectedPatient
                          ? "border-primary bg-white"
                          : "border-transparent bg-[#f7f8fa] hover:bg-white"
                      }`}
                    >
                      <span className="block font-medium">
                        {patient.lastName} {patient.firstName} {patient.middleName}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {patient.phone || "Телефон не указан"} · приемов: {visitCount}
                      </span>
                      {nearestNextVisitDate && (
                        <span className="mt-1 block text-xs font-semibold text-red-600">
                          Следующий прием: {nearestNextVisitDate}
                        </span>
                      )}
                    </button>

                    {isExpandedPatient && (
                      <div className="mt-2 overflow-hidden rounded-md border bg-white">
                        <div className="grid grid-cols-[86px_1fr] gap-2 border-b bg-[#e5e8ed] px-3 py-2 text-xs font-semibold text-muted-foreground">
                          <span>Дата</span>
                          <span>Прием</span>
                        </div>
                        {visitsForPatient.length > 0 ? (
                          visitsForPatient.map((visit) => {
                            const isNearestScheduledVisit =
                              Boolean(nearestNextVisitDate) &&
                              visit.nextVisitDate === nearestNextVisitDate;

                            return (
                              <button
                                key={visit.id}
                                type="button"
                                onClick={() =>
                                  requestProtectedAction((sourceRecords) => {
                                    recordsRef.current = sourceRecords;
                                    setRecords(sourceRecords);
                                    setSelectedPatientId(patient.id);
                                    selectVisit(visit.id);
                                  })
                                }
                                className={`grid w-full grid-cols-[86px_1fr] gap-2 px-3 py-2 text-left text-xs transition hover:bg-muted/70 ${
                                  selectedVisitId === visit.id ? "bg-primary/10 text-primary" : ""
                                }`}
                              >
                                <span className="font-medium">{visit.recordDate}</span>
                                <span className="min-w-0">
                                  <span className="block truncate">{visit.consultationType}</span>
                                  {isNearestScheduledVisit && (
                                    <span className="mt-0.5 block font-semibold text-red-600">
                                      Следующий прием: {nearestNextVisitDate}
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-3 text-xs text-muted-foreground">
                            Приемов пока нет.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0 rounded-lg border bg-[#f1f3f6] shadow-sm">
            {selectedPatient && selectedVisit ? (
              <>
                <div className="border-b p-4">
                  <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">
                          {selectedPatient.lastName} {selectedPatient.firstName}{" "}
                          {selectedPatient.middleName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedVisit.recordDate} · {selectedVisit.consultationType}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                        value={selectedVisitId}
                        onChange={(event) => setSelectedVisitId(event.target.value)}
                      >
                        {patientVisits.map((visit) => (
                          <option key={visit.id} value={visit.id}>
                            {visit.recordDate} · {visit.consultationType}
                          </option>
                        ))}
                      </select>
                      <Button variant="outline" size="sm" onClick={copyVisit}>
                        <Copy className="mr-2 h-4 w-4" />
                        Копировать
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPrintDialogOpen(true)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Печать
                      </Button>
                      <Button size="sm" onClick={saveRecords}>
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <RecordSection title="Пациент">
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Фамилия" value={selectedPatient.lastName} onChange={(value) => updatePatient("lastName", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Имя" value={selectedPatient.firstName} onChange={(value) => updatePatient("firstName", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Отчество" value={selectedPatient.middleName} onChange={(value) => updatePatient("middleName", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Дата рождения" type="date" value={selectedPatient.birthDate} onChange={(value) => updatePatient("birthDate", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Телефон" value={selectedPatient.phone} onChange={(value) => updatePatient("phone", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Дата записи" type="date" value={selectedVisit.recordDate} onChange={(value) => updateVisit("recordDate", value)} />
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Полных лет" value={selectedVisit.ageAtVisit || getAgeAtDate(selectedPatient.birthDate, selectedVisit.recordDate)} onChange={(value) => updateVisit("ageAtVisit", value)} />
                    <div className="md:col-span-2 xl:col-span-3">
                      <Area onActivateSuggestions={activateSuggestionTarget} label="Адрес" value={selectedPatient.address} onChange={(value) => updatePatient("address", value)} />
                    </div>
                  </RecordSection>

                  <RecordSection title="Осмотр">
                    <Field onActivateSuggestions={activateSuggestionTarget} label="Врач" value={selectedVisit.doctorName} onChange={(value) => updateVisit("doctorName", value)} />
                    <div className="space-y-1.5">
                      <Label>Консультация врача</Label>
                      <select
                        className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
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
            ) : (
              <div className="p-8 text-center text-muted-foreground">Выберите или создайте пациента.</div>
            )}
          </section>

          {activeSuggestionTarget && (
            <SuggestionPanel
              label={activeSuggestionTarget.label}
              suggestions={activeSuggestions}
              phrase={suggestionPhrase}
              onPhraseChange={setSuggestionPhrase}
              onAdd={addActiveSuggestion}
              onDelete={deleteActiveSuggestion}
              onPick={activeSuggestionTarget.insert}
              onClose={() => setActiveSuggestionTarget(null)}
            />
          )}
        </div>
      </main>
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
