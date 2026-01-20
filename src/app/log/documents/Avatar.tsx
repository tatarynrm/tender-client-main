"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { RHFFileInput } from "@/shared/components/Inputs/FileInput";
import api from "@/shared/api/instance.api";

interface ProfileFormValues {
  avatar: File[];
}

export function UserAvatarForm() {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ProfileFormValues>({
    defaultValues: { avatar: [] },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!data.avatar || data.avatar.length === 0) return;

    const formData = new FormData();
    // Додаємо файл у масив (як ти і хотів)
    data.avatar.forEach((file) => {
      formData.append("avatar", file); 
    });

    try {
      // ❗ ВАЖЛИВО: передаємо folderType в URL, щоб Multer побачив його миттєво
      const response = await api.post("/cocktails/avatar?folderType=avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        console.log("Аватар успішно завантажено");
      }
    } catch (error) {
      console.error("Помилка завантаження:", error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-8 bg-white/80 border-slate-200 rounded-[3rem]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Налаштування профілю</h2>
        </div>

        <RHFFileInput
          control={control}
          name="avatar"
          label="Ваш Аватар"
          multiple={false}
          maxFiles={1}
          accept={{ "image/*": [".jpeg", ".jpg", ".png", ".webp"] }}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-blue-600 rounded-[2rem] font-black uppercase">
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
          Оновити профіль
        </Button>
      </form>
    </Card>
  );
}