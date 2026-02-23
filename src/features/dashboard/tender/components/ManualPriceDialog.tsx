// components/ManualPriceDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button, Input } from "@/shared/components/ui";

export function ManualPriceDialog({
  open,
  onOpenChange,
  onConfirm,
  currentPrice,
  currentValut,
}: any) {
  // Стан для введеної ціни
  const [price, setPrice] = useState(currentPrice || "");
  // Стан для відображення кроку підтвердження (якщо ціна < 50%)
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  // Скидаємо стани при відкритті/закритті модалки
  useEffect(() => {
    if (open) {
      setPrice(currentPrice || "");
      setShowConfirmStep(false);
    }
  }, [open, currentPrice]);

  // 1. Перевіряємо, чи взагалі задана поточна ціна
  const hasLimit =
    currentPrice !== undefined && currentPrice !== null && currentPrice > 0;

  // 2. Логіка помилки: тільки якщо ліміт існує ТА введена ціна більша за нього
  const isPriceTooHigh = hasLimit && Number(price) > currentPrice;

  // 3. Валідація для кнопки: не можна відправити порожнє, нуль або завелику ціну
  const isPriceInvalid = !price || Number(price) <= 0 || isPriceTooHigh;

  // 4. Обробник натискання "Надіслати"
  const handleConfirmClick = () => {
    // Перевіряємо, чи введена ціна менша або дорівнює 50% від поточної
    const isHalfPrice = hasLimit && Number(price) <= currentPrice * 0.5;

    // Якщо це половина ціни і ми ще не показували попередження -> показуємо
    if (isHalfPrice && !showConfirmStep) {
      setShowConfirmStep(true);
      return; // Зупиняємо виконання, щоб не відправити дані
    }

    // Якщо все ок (або користувач підтвердив занижену ціну) -> відправляємо
    onConfirm(price, "Користувацька ціна");
    setShowConfirmStep(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {showConfirmStep ? "Підтвердження ставки" : "Вказати власну ціну"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {showConfirmStep ? (
            // === КРОК ПІДТВЕРДЖЕННЯ (Warning) ===
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Ви впевнені, що хочете запропонувати таку ціну : {price} ?
              </p>
            </div>
          ) : (
            // === СТАНДАРТНИЙ КРОК (Input) ===
            <>
              <label
                className={`text-sm mb-2 block ${isPriceTooHigh ? "text-red-500" : ""}`}
              >
                Ваша пропозиція {currentValut ? `(${currentValut})` : ""}:
              </label>

              <Input
                type="number"
                value={price}
                className={
                  isPriceTooHigh
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setPrice(val === "" ? "" : Number(val));
                }}
                placeholder="Введіть суму..."
              />

              {hasLimit ? (
                <p
                  className={`text-xs mt-2 ${isPriceTooHigh ? "text-red-500" : "text-muted-foreground"}`}
                >
                  {isPriceTooHigh
                    ? `Максимальна ціна: ${currentPrice} ${currentValut}`
                    : `Поточна ціна: ${currentPrice} ${currentValut}`}
                </p>
              ) : (
                <p className="text-xs mt-2 text-muted-foreground">
                  Вкажіть бажану ціну купівлі
                </p>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {showConfirmStep ? (
            // Кнопки для кроку підтвердження
            <>
              <Button
                variant="outline"
                onClick={() => setShowConfirmStep(false)}
              >
                Назад
              </Button>
              <Button variant="destructive" onClick={handleConfirmClick}>
                Так, відправити
              </Button>
            </>
          ) : (
            // Кнопки для стандартного кроку
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Скасувати
              </Button>
              <Button disabled={isPriceInvalid} onClick={handleConfirmClick}>
                Надіслати пропозицію
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
