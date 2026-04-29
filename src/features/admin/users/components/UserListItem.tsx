"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import {
  UserCircle2,
  Mail,
  Building2,
  ShieldAlert,
  Edit,
  Trash2,
  GripVertical,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IUserAccount } from "../../types/user.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button, Input } from "@/shared/components/ui";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { toast } from "sonner";

interface UserListItemProps {
  user: IUserAccount;
  isOnline: boolean;
}

export function UserListItem({ user, isOnline }: UserListItemProps) {
  const router = useRouter();
  const { deleteUser, isDeleting } = useAdminUsers();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");

  const fullName =
    `${user.person?.surname || ""} ${user.person?.name || ""} ${user.person?.last_name || ""}`.trim() ||
    "Без імені";

  const companyName =
    user.company?.company_name || user.migrate_company || "Немає компанії";
  const edrpou = user.company?.edrpou || "—";

  const role = user.person?.person_role;
  const isAdmin = role?.is_admin;
  const isManager = role?.is_manager;

  const roleText = isAdmin ? "Адмін" : isManager ? "Менеджер" : "Користувач";
  const roleColor = isAdmin
    ? "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900"
    : isManager
      ? "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900"
      : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

  const handleDelete = async () => {
    if (confirmPhrase !== "ict") {
      toast.error("Введіть правильну фразу для підтвердження");
      return;
    }

    try {
      await deleteUser(user.id);
      setIsDeleteDialogOpen(false);
      setConfirmPhrase("");
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all hover:shadow-md overflow-hidden",
          user.is_blocked && "opacity-75 grayscale-[0.2]",
        )}
      >
        {/* Status indicator bar */}
        <div
          className={cn(
            "absolute top-0 left-0 bottom-0 w-1",
            user.is_blocked
              ? "bg-red-500"
              : isAdmin
                ? "bg-rose-500"
                : isManager
                  ? "bg-blue-500"
                  : "bg-emerald-500",
          )}
        />

        {/* Avatar & ID */}
        <div className="relative flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors">
            <UserCircle2 size={24} strokeWidth={2.5} />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-3 w-3 border-2 border-white dark:border-zinc-950",
                isOnline ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600",
              )}
            ></span>
          </span>
        </div>

        {/* User basic info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 min-w-0">
            <div className="flex flex-col">
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                {fullName}
                {user.verified && (
                  <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                )}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono bg-zinc-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                  #{user.id}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={12} className="opacity-70" />
                  <span className="truncate">{user.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Building2 size={14} className="opacity-70 shrink-0" />
                <span className="text-[13px] font-semibold truncate">
                  {companyName}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-5">
                ЄДРПОУ: {edrpou}
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col gap-1.5">
              <div
                className={cn(
                  "px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider w-fit",
                  roleColor,
                )}
              >
                {roleText}
              </div>
              {user.is_blocked && (
                <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldAlert size={12} />
                  <span>Блоковано</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 hidden lg:flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar size={13} className="opacity-70" />
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-medium">
              <Clock size={11} className="opacity-70" />
              <span>Реєстрація</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <GripVertical
                  size={20}
                  className="text-slate-600 dark:text-slate-400"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer text-sm font-medium"
              >
                <Edit size={16} className="text-blue-500" />
                <span>Редагувати</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer text-sm font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20"
              >
                <Trash2 size={16} />
                <span>Видалити</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <div className="bg-rose-600 p-6 flex flex-col items-center justify-center text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trash2 size={120} />
            </div>
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-xl border border-white/30">
              <ShieldAlert size={32} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white text-center">
              Видалення користувача
            </DialogTitle>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Ви збираєтеся видалити акаунт користувача:
                </p>
                <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-white truncate">
                    {fullName}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {user.email}
                  </p>
                </div>
                <p className="mt-4 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                  Ця дія є незворотною!
                </p>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase ml-1 mb-1.5 block">
                  Для підтвердження введіть{" "}
                  <span className="text-rose-500">ict</span>
                </label>
                <Input
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder="ict"
                  autoFocus
                  className={cn(
                    "h-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-center font-mono font-bold tracking-widest",
                    confirmPhrase === "ict" &&
                      "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-900 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="rounded-xl font-semibold h-11"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmPhrase("");
              }}
            >
              Скасувати
            </Button>
            <Button
              variant={confirmPhrase === "ict" ? "destructive" : "outline"}
              onClick={handleDelete}
              disabled={confirmPhrase !== "ict" || isDeleting}
              className={cn(
                "rounded-xl font-bold h-11 px-6 shadow-lg shadow-rose-500/20 transition-all",
                confirmPhrase !== "ict" &&
                  "opacity-50 grayscale cursor-not-allowed shadow-none",
              )}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Видалення...
                </div>
              ) : (
                "Видалити назавжди"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
