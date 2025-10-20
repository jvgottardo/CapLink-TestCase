"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCurrentUser, deleteUser } from "../../utils/auth";


interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // controla o modal
  const router = useRouter();


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Você precisa estar logado.");
          router.push("/login");
          return;
        }
        const u = await getCurrentUser(token);
        setUser(u);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    try {
      await deleteUser(token);
      toast.success("Conta excluída com sucesso!");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir a conta.");
    } finally {
      setIsOpen(false);
    }
  };

  if (loading) return <p className="text-center py-10">Carregando...</p>;
  if (!user) return <p className="text-center py-10">Usuário não encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações do usuário</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <Input value={user.name} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de usuário</label>
            <Input value={user.role} disabled />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-4">
        {/* <Button variant="secondary" className="cursor-pointer" onClick={() => router.push("/profile/edit")}>
          Editar Perfil
        </Button> */}

        <Button variant="secondary" className="cursor-pointer" onClick={() => router.push("/orders")}>
          Histórico de compras
        </Button>

        {/* Modal AlertDialog para excluir */}
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="cursor-pointer">
              Excluir Conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. Todos os seus dados serão apagados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
