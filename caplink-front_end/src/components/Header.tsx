"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingCart, Heart, UserCircle } from "lucide-react";
import { getCurrentUser } from "../utils/auth"; // função fictícia para pegar usuário logado
import { useLogout } from "../utils/auth";
import { getItemsInCart } from "../utils/api";

interface User {
  name: string;
  role: "vendor" | "client";
  avatar_url?: string;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const logout = useLogout();


  useEffect(() => {
    const token = localStorage.getItem("token");
    // Aqui você pode pegar o usuário logado via API ou contexto
    const fetchUserAndCart = async () => {
      try {
        const u = await getCurrentUser(token);
        if (u) {
          setUser(u);

          // Busca os itens do carrinho do usuário logado
          getItemsInCart().then((res) => {
            setCartItems(res.cart.items || []);
          });

        }
      } catch (error) {
        console.error("Erro ao buscar usuário ou carrinho:", error);
      }
    };

    fetchUserAndCart();
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          CapLink
        </Link>

        {/* Links e ações */}
        <div className="flex items-center gap-4">


          {/* Usuário / Profile */}
          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" className="relative cursor-pointer">
                  <ShoppingCart />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/favorites">
                <Button variant="ghost" className="cursor-pointer">
                  <Heart />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    ) : (
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === "vendor" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button className="cursor-pointer">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
