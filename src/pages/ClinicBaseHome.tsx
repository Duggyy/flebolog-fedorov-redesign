import { Link } from "react-router-dom";
import { Database, ShieldCheck, UsersRound } from "lucide-react";
import ClinicBaseHeader from "@/components/ClinicBaseHeader";
import { Button } from "@/components/ui/button";

const ClinicBaseHome = () => {
  return (
    <div className="min-h-screen bg-section-bg">
      <ClinicBaseHeader />
      <main className="container py-8 md:py-12">
        <section className="rounded-lg border bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-3xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Database className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">ClinicBase</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Отдельный веб-интерфейс для ведения приемов, пациентов, врачей и медицинских записей.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/login">Войти</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <UsersRound className="mb-3 h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">Рабочее место врача</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Пациенты, история приемов, осмотры, УЗИ, диагнозы, назначения, манипуляции и печатные формы.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <ShieldCheck className="mb-3 h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold">Администрирование</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Управление врачами, логинами, паролями и доступом к системе.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClinicBaseHome;
