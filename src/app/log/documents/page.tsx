"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "@/shared/api/instance.api";
import { toFormData } from "@/shared/utils/toFormData";
import { RHFFileInput } from "@/shared/components/Inputs/FileInput";
import CocktailList from "./CoctailsList";
import { ACCEPTED_FILES } from "@/shared/constants/file-types";
import { UserAvatarForm } from "./Avatar";

interface CocktailFormValues {
  name: string;
  price: string;
  folderType: string;
  files: File[]; // Тепер це масив файлів, а не FileList
}

export default function AddCocktailForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    control, // <-- Додаємо сюди control
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CocktailFormValues>({
    defaultValues: {
      name: "",
      price: "",
      folderType: "cocktails",
      files: [],
    },
  });

  const onSubmit = async (data: CocktailFormValues) => {
    setLoading(true);

    // Тепер дані в data.files вже є масивом завдяки нашому новому FileInput
    const formData = toFormData(data);

    try {
      await api.post(`/cocktails/add`, formData);
      alert("Успішно опубліковано!");
      reset();
    } catch (err: any) {
      alert(`Помилка: ${err.response?.data?.message || "Збій завантаження"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white border border-zinc-200 rounded-[32px] space-y-4"
      >
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-zinc-400">
            Назва напою
          </label>
          <input
            {...register("name", { required: "Назва обов'язкова" })}
            className="w-full p-3 bg-zinc-50 rounded-xl border-none focus:ring-2 ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400">
              Ціна (UAH)
            </label>
            <input
              {...register("price", { required: "Вкажіть ціну" })}
              type="number"
              step="0.01"
              className="w-full p-3 bg-zinc-50 rounded-xl border-none"
            />
          </div>

          <RHFFileInput
            control={control}
            name="files"
            label="Будь-які файли"
            multiple={true}
            // accept={{}} // Порожній об'єкт дозволяє вибрати будь-який файл
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 py-4 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "ЗБЕРЕЖЕННЯ..." : "ОПУБЛІКУВАТИ КОКТЕЙЛЬ"}
        </button>
      </form>

      {/* <RHFFileInput
        control={control}
        name="files"
        label="Будь-які файли"
        multiple={true}
        //   accept={{ ...ACCEPTED_FILES.images, ...ACCEPTED_FILES.archive }}
      /> */}

      <CocktailList />

      <UserAvatarForm />
    </>
  );
}
