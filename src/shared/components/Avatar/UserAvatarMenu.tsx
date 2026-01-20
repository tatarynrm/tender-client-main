"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";

interface UserAvatarMenuProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
}

export function UserAvatarMenu({
  userName,
  userEmail,
  avatarUrl,
}: UserAvatarMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Керуємо станом меню
  const { logout } = useProfileLogoutMutation();

  const handleConfirmLogout = () => {
    logout();
    setIsDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-9 w-9 cursor-pointer border border-zinc-200 dark:border-zinc-800 transition-transform duration-200 hover:scale-[1.05] active:scale-95">
            <AvatarImage src={avatarUrl} alt={`${userName}'s avatar`} />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold uppercase text-sm">
              {userName ? userName.charAt(0) : "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
          <DropdownMenuLabel className="px-2 py-1.5 flex flex-col space-y-1">
            <span className="text-sm font-semibold leading-none">
              {userName}
            </span>
            <span className="text-xs leading-none text-zinc-500">
              {userEmail}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1 my-2" />

          <DropdownMenuItem
            asChild
            className="px-2 py-2 rounded-md cursor-pointer"
          >
            <Link
              href="/profile"
              className="flex items-center space-x-2 w-full"
            >
              <User size={16} className="text-zinc-500" />
              <span>Мій профіль</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="px-2 py-2 rounded-md cursor-pointer"
          >
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 w-full"
            >
              <LayoutDashboard size={16} className="text-zinc-500" />
              <span>Панель керування</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="px-2 py-2 rounded-md cursor-pointer"
          >
            <Link
              href="/settings"
              className="flex items-center space-x-2 w-full"
            >
              <Settings size={16} className="text-zinc-500" />
              <span>Налаштування</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-1 my-2" />

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Зупиняємо стандартне закриття Radix, щоб вручну керувати черговістю
              setIsMenuOpen(false); // Спершу закриваємо меню
              setTimeout(() => {
                setIsDialogOpen(true); // Потім відкриваємо діалог (через невеликий таймаут для стабільності фокусу)
              }, 100);
            }}
            className="px-2 py-2 rounded-md cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            <LogOut size={16} className="mr-2" />
            <span>Вийти</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Модальне підтвердження */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вихід із системи</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ви впевнені, що хочете вийти із системи?
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Ні
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>
              Так
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
