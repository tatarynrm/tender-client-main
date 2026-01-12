// components/ManualPriceDialog.tsx
import { useState } from "react";
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
}: any) {
  const [price, setPrice] = useState(currentPrice);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вказати власну ціну</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm mb-2 block">Ваша пропозиція:</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => {
              const val = e.target.value;
              // Якщо користувач все видалив, записуємо порожній рядок
              if (val === "") {
                setPrice("");
              } else {
                setPrice(Number(val));
              }
            }}
            placeholder="Введіть суму..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={() => onConfirm(price, "Користувацька ціна")}>
            Надіслати пропозицію
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
