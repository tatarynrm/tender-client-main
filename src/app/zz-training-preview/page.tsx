"use client";

// ТИМЧАСОВО: візуальна перевірка блоку-попередження на сторінці навчання. Видалити.
import { Suspense } from "react";
import TrainingPage from "@/features/log/training/TrainingPage";
import { trainingService } from "@/features/log/services/training.service";

trainingService.getList = async () => ({ status: "ok", content: [] });

export default function Preview() {
  return (
    <div className="custom-app-bg min-h-screen p-4">
      <Suspense>
        <TrainingPage isAdmin={false} viewerLabel="Тест" />
      </Suspense>
    </div>
  );
}
