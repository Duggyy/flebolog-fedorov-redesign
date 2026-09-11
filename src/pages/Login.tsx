import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import ClinicBaseHeader from "@/components/ClinicBaseHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveAuthSession } from "@/lib/auth-session";
import { apiLogin, isApiUnavailable } from "@/lib/clinicbase-api";
import { loadDoctorUsers } from "@/lib/doctor-users";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const session = await apiLogin(login.trim(), password.trim());
      saveAuthSession(session);
      navigate(session.role === "admin" ? "/doctor-admin" : "/doctor-db");
      return;
    } catch (error) {
      if (!isApiUnavailable(error)) {
        toast({ title: "Вход не выполнен", description: "Проверьте логин и пароль." });
        return;
      }

      if (login.trim() === "admin" && password.trim() === "1234") {
        saveAuthSession({ role: "admin" });
        navigate("/doctor-admin");
        return;
      }

      const doctor = loadDoctorUsers().find(
        (item) => item.login === login.trim() && item.password === password.trim(),
      );

      if (doctor) {
        saveAuthSession({ role: "doctor", doctorId: doctor.id });
        navigate("/doctor-db");
        return;
      }
    }

    toast({ title: "Вход не выполнен", description: "Проверьте логин и пароль." });
  };

  return (
    <div className="min-h-screen bg-section-bg">
      <ClinicBaseHeader hideAction />
      <main className="container py-8 md:py-12">
        <section className="mx-auto max-w-md overflow-hidden rounded-lg border bg-[#f1f3f6] shadow-sm">
          <div className="flex items-center gap-3 border-b bg-[#d8dde5] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Войти</h1>
              <p className="text-sm text-muted-foreground">Единый вход для врача и администратора</p>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label>Логин</Label>
              <Input value={login} onChange={(event) => setLogin(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Пароль</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleLogin();
                }}
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Войти
            </Button>
            <p className="text-xs text-muted-foreground">
              Демо: admin / 1234, fedorov / 1234, ivanova / 1234
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
