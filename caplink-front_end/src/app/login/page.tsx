"use client";

import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { loginUser } from "../../utils/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form);

      window.location.href = "/";

    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4 mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" className="cursor-pointer" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
      </form>
      <div>
        <p className="mt-4">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-blue-500 underline">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
