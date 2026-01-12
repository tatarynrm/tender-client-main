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
  // Початкове значення: поточна ціна або порожній рядок, якщо ціни немає
  const [price, setPrice] = useState(currentPrice || "");

  useEffect(() => {
    if (open) {
      setPrice(currentPrice || "");
    }
  }, [open, currentPrice]);

  // 1. Перевіряємо, чи взагалі задана поточна ціна (чи є з чим порівнювати)
  const hasLimit = currentPrice !== undefined && currentPrice !== null && currentPrice > 0;

  // 2. Логіка помилки: тільки якщо ліміт існує ТА введена ціна більша за нього
  const isPriceTooHigh = hasLimit && Number(price) > currentPrice;
  
  // 3. Валідація для кнопки: не можна відправити порожнє, нуль або завелику ціну
  const isPriceInvalid = !price || Number(price) <= 0 || isPriceTooHigh;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вказати власну ціну</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className={`text-sm mb-2 block ${isPriceTooHigh ? "text-red-500" : ""}`}>
            Ваша пропозиція {currentValut ? `(${currentValut})` : ""}:
          </label>
          
          <Input
            type="number"
            value={price}
            className={isPriceTooHigh ? "border-red-500 focus-visible:ring-red-500" : ""}
            onChange={(e) => {
              const val = e.target.value;
              setPrice(val === "" ? "" : Number(val));
            }}
            placeholder="Введіть суму..."
          />

          {/* Виводимо підказку про ліміт тільки якщо він існує */}
          {hasLimit ? (
            <p className={`text-xs mt-2 ${isPriceTooHigh ? "text-red-500" : "text-muted-foreground"}`}>
              {isPriceTooHigh 
                ? `Максимальна ціна: ${currentPrice} ${currentValut}` 
                : `Поточна ціна: ${currentPrice} ${currentValut}`}
            </p>
          ) : (
            <p className="text-xs mt-2 text-muted-foreground">
              Вкажіть бажану ціну купівлі
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button 
            disabled={isPriceInvalid} 
            onClick={() => onConfirm(price, "Користувацька ціна")}
          >
            Надіслати пропозицію
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}