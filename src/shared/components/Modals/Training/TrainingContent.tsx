"use client";

import React from "react";
import { Play, Info } from "lucide-react";
import Image from "next/image";

interface TrainingVideo {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  previewUrl: string;
}

const trainingData: TrainingVideo[] = [
  {
    id: 1,
    title: "Відео №1: Відгуки пропозиції, Штучний інтелект, Тендери",
    description: "Дізнайтеся, як максимально ефективно використовувати нашу платформу для пошуку та створення тендерів за допомогою ШІ.",
    videoUrl: "https://www.youtube.com/embed/BgdLG5RqsZc",
    previewUrl: "/images/learn/training_video_preview_1.png",
  },

];

const VideoCard = ({ video }: { video: TrainingVideo }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Video Card Title */}
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-sm font-black text-indigo-500">
            {video.id}
          </span>
          {video.title}
        </h3>
        {video.description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl pl-10">
            {video.description}
          </p>
        )}
      </div>

      {/* Video Container */}
      <div className="relative group rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10 bg-black aspect-video">
        {!isPlaying ? (
          <div
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <Image
              src={video.previewUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 dark:opacity-70"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-indigo-600/90 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500 text-white">
                <Play size={32} fill="currentColor" className="ml-1" />
              </div>
            </div>
            {/* Click to Watch Overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
              <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
                <Play size={14} fill="currentColor" /> Натисніть, щоб дивитися
              </span>
            </div>
          </div>
        ) : (
          <iframe
            src={`${video.videoUrl}?autoplay=1`}
            title={video.title}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {/* Preview Hint */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/20 p-5 rounded-3xl flex items-start gap-4">
        <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0">
          <Info size={18} />
        </div>
        <div>
          <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1 uppercase tracking-wider">Порада</h4>
          <p className="text-amber-700/80 dark:text-amber-400/60 text-xs leading-relaxed font-medium">
            Якщо відео не відображається, переконайтеся, що ваш браузер дозволяє відтворення вмісту з YouTube або перейдіть за прямим посиланням.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TrainingContent = () => {
  return (
    <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 rounded-[2rem]">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <Play size={20} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Навчальний центр</h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Покращуйте свої навички роботи з нашою платформою</p>
      </div>

      {/* Content */}
      <div className="p-8 space-y-12">
        {[...trainingData]
          .sort((a, b) => b.id - a.id)
          .map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
      </div>

      {/* Footer */}
      <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Будемо додавати нові матеріали з часом</p>
      </div>
    </div>
  );
};
