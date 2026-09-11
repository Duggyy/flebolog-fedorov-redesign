import { useEffect, useMemo, useState } from "react";
import { KeyRound, LogOut, Save, Search, Shuffle, Trash2, UserPlus, UsersRound } from "lucide-react";
import ClinicBaseHeader from "@/components/ClinicBaseHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "@/lib/auth-session";
import {
  apiDeleteDoctor,
  apiGetDoctors,
  apiLogin,
  apiLogout,
  apiSaveDoctor,
  isApiUnavailable,
} from "@/lib/clinicbase-api";
import {
  DoctorUser,
  emptyDoctorUser,
  loadDoctorUsers,
  saveDoctorUsers,
} from "@/lib/doctor-users";

const Field = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
  </div>
);

const DoctorAdmin = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(loadAuthSession()?.role === "admin");
  const [adminLogin, setAdminLogin] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [doctors, setDoctors] = useState(loadDoctorUsers);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id ?? "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    apiGetDoctors()
      .then((serverDoctors) => {
        setDoctors(serverDoctors);
        saveDoctorUsers(serverDoctors);
        setSelectedDoctorId((currentId) => currentId || serverDoctors[0]?.id || "");
      })
      .catch((error) => {
        if (!isApiUnavailable(error)) {
          toast({ title: "Сервер недоступен", description: "Не удалось загрузить врачей из базы." });
        }
      });
  }, [isLoggedIn, toast]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.speciality} ${doctor.organization} ${doctor.phone} ${doctor.email}`
        .toLowerCase()
        .includes(query),
    );
  }, [doctors, search]);

  const selectedDoctor =
    doctors.find((doctor) => doctor.id === selectedDoctorId) ?? filteredDoctors[0];

  const hasDuplicateLogin = Boolean(
    selectedDoctor?.login &&
      doctors.some(
        (doctor) =>
          doctor.id !== selectedDoctor.id &&
          doctor.login.trim().toLowerCase() === selectedDoctor.login.trim().toLowerCase(),
      ),
  );
  const hasMissingOrganization = Boolean(selectedDoctor && !selectedDoctor.organization.trim());

  const persistDoctors = (nextDoctors: DoctorUser[]) => {
    setDoctors(nextDoctors);
    saveDoctorUsers(nextDoctors);
  };

  const handleLogin = async () => {
    try {
      const session = await apiLogin(adminLogin.trim(), adminPassword.trim());
      if (session.role === "admin") {
        saveAuthSession(session);
        setIsLoggedIn(true);
        return;
      }
    } catch (error) {
      if (!isApiUnavailable(error)) {
        toast({ title: "Вход не выполнен", description: "Проверьте логин и пароль администратора." });
        return;
      }

      if (adminLogin.trim() === "admin" && adminPassword.trim() === "1234") {
        saveAuthSession({ role: "admin" });
        setIsLoggedIn(true);
        return;
      }
    }

    toast({ title: "Вход не выполнен", description: "Проверьте логин и пароль администратора." });
  };

  const addDoctor = () => {
    const nextDoctor = {
      ...emptyDoctorUser(),
      name: "Новый пользователь",
      login: `doctor${doctors.length + 1}`,
      password: "1234",
    };
    persistDoctors([...doctors, nextDoctor]);
    setSelectedDoctorId(nextDoctor.id);
  };

  const updateDoctor = (field: keyof DoctorUser, value: string) => {
    if (!selectedDoctor) return;
    persistDoctors(
      doctors.map((doctor) =>
        doctor.id === selectedDoctor.id ? { ...doctor, [field]: value } : doctor,
      ),
    );
  };

  const deleteDoctor = async () => {
    if (!selectedDoctor) return;
    try {
      await apiDeleteDoctor(selectedDoctor.id);
    } catch (error) {
      if (!isApiUnavailable(error)) {
        toast({ title: "Удаление не выполнено", description: "Сервер не смог удалить пользователя." });
        return;
      }
    }
    const nextDoctors = doctors.filter((doctor) => doctor.id !== selectedDoctor.id);
    persistDoctors(nextDoctors);
    setSelectedDoctorId(nextDoctors[0]?.id ?? "");
    toast({ title: "Пользователь удален", description: selectedDoctor.name });
  };

  const saveSelectedDoctor = async () => {
    if (!selectedDoctor || hasDuplicateLogin || hasMissingOrganization) return;
    try {
      const savedDoctor = await apiSaveDoctor(selectedDoctor);
      const nextDoctors = doctors.map((doctor) =>
        doctor.id === selectedDoctor.id ? { ...savedDoctor, password: selectedDoctor.password } : doctor,
      );
      persistDoctors(nextDoctors);
      setSelectedDoctorId(savedDoctor.id);
      toast({ title: "Данные сохранены", description: "Пользователь обновлен на сервере." });
      return;
    } catch (error) {
      if (!isApiUnavailable(error)) {
        toast({ title: "Сохранение не выполнено", description: "Проверьте обязательные поля и уникальность логина." });
        return;
      }
    }

    saveDoctorUsers(doctors);
    toast({ title: "Данные сохранены", description: "Локальный демо-режим." });
  };

  const generatePassword = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const password = Array.from({ length: 10 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
    updateDoctor("password", password);
    toast({ title: "Пароль сгенерирован" });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-section-bg">
        <ClinicBaseHeader />
        <main className="container py-8 md:py-12">
          <section className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Админка врачей</h1>
                <p className="text-sm text-muted-foreground">Вход администратора</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Логин" value={adminLogin} onChange={setAdminLogin} />
              <Field
                label="Пароль"
                type="password"
                value={adminPassword}
                onChange={setAdminPassword}
              />
              <Button className="w-full" onClick={handleLogin}>
                Войти
              </Button>
              <p className="text-xs text-muted-foreground">Демо: admin / 1234</p>
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
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold">Админка врачей</h1>
            <p className="text-sm text-muted-foreground">
              Пользователи, которые могут входить в базу приемов
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={addDoctor}>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                apiLogout().catch(() => undefined);
                clearAuthSession();
                setIsLoggedIn(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Поиск пользователя"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[620px] overflow-y-auto p-2">
              {filteredDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doctor.id)}
                  className={`mb-2 w-full rounded-md border p-3 text-left transition ${
                    selectedDoctor?.id === doctor.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <span className="block font-medium">{doctor.name || "Без ФИО"}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {doctor.speciality || "Специальность не указана"} · {doctor.login || "без логина"}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-lg border bg-white p-4 shadow-sm">
            {selectedDoctor ? (
              <>
                <div className="mb-5 flex flex-col justify-between gap-3 border-b pb-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDoctor.name || "Новый пользователь"}</h2>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.speciality}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={deleteDoctor}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-base font-semibold">Данные врача</h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field
                    label="ФИО"
                    value={selectedDoctor.name}
                    onChange={(value) => updateDoctor("name", value)}
                  />
                  <Field
                    label="Дата рождения"
                    type="date"
                    value={selectedDoctor.birthDate}
                    onChange={(value) => updateDoctor("birthDate", value)}
                  />
                  <Field
                    label="Специальность"
                    value={selectedDoctor.speciality}
                    onChange={(value) => updateDoctor("speciality", value)}
                  />
                  <div className="space-y-1.5">
                    <Label>Организация *</Label>
                    <Input
                      required
                      value={selectedDoctor.organization}
                      onChange={(event) => updateDoctor("organization", event.target.value)}
                      aria-invalid={hasMissingOrganization}
                    />
                    {hasMissingOrganization && (
                      <p className="text-xs font-medium text-destructive">
                        Организация обязательна для отображения врача в базе приемов.
                      </p>
                    )}
                  </div>
                  <Field
                    label="Адрес"
                    value={selectedDoctor.address}
                    onChange={(value) => updateDoctor("address", value)}
                  />
                  <Field
                    label="Телефон"
                    value={selectedDoctor.phone}
                    onChange={(value) => updateDoctor("phone", value)}
                  />
                  <Field
                    label="Имейл"
                    type="email"
                    value={selectedDoctor.email}
                    onChange={(value) => updateDoctor("email", value)}
                  />
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Доступ к системе</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                    <div className="space-y-1.5">
                      <Label>Логин</Label>
                      <Input
                        value={selectedDoctor.login}
                        onChange={(event) => updateDoctor("login", event.target.value)}
                        aria-invalid={hasDuplicateLogin}
                      />
                      {hasDuplicateLogin && (
                        <p className="text-xs font-medium text-destructive">
                          Такой логин уже назначен другому пользователю.
                        </p>
                      )}
                    </div>
                    <Field
                      label="Пароль"
                      value={selectedDoctor.password}
                      onChange={(value) => updateDoctor("password", value)}
                    />
                    <Button variant="outline" type="button" onClick={generatePassword}>
                      <Shuffle className="mr-2 h-4 w-4" />
                      Сгенерировать
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={saveSelectedDoctor} disabled={hasDuplicateLogin || hasMissingOrganization}>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Добавьте первого пользователя.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DoctorAdmin;
