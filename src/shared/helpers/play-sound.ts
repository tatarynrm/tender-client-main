/**
 * Функція для відтворення звуку.
 * @param path - шлях до файлу з папки public (наприклад, '/sounds/notification.mp3')
 */
export const playSound = (path: string) => {
  const volume = Number(localStorage.getItem("app-volume") ?? "0.5");
  
  if (volume <= 0) return; // Якщо звук вимкнено

  const audio = new Audio(path);
  audio.volume = volume; // Встановлюємо гучність від 0 до 1
  audio.currentTime = 0;
  audio.play().catch(() => {}); 
};