"use client";

import { useState } from "react";
import { Switch } from "@/shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "../ui";

interface Props {
  field: any;
  text?: string;
  label?: string;
  id?: string; // Додаємо id до пропсів
}

export function IctSwitchWithConfirm({ field, text, label, id }: Props) {
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (val: boolean) => {
    if (val) {
      // Якщо увімкнули — відкриваємо діалог
      setOpenDialog(true);
    } else {
      // Вимкнення без підтвердження
      field.onChange(false);
    }
  };

  const confirmEnable = () => {
    field.onChange(true);
    setOpenDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Switch
          id={id} // Передаємо id сюди
          checked={field.value ?? false}
          onCheckedChange={handleChange}
          className="data-[state=checked]:bg-teal-600"
        />
        {label && (
          <Label className="text-xs cursor-pointer" htmlFor={id}>
            {label}
          </Label>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Підтвердьте дію</DialogTitle>
            <DialogDescription>{text}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Відмінити
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700" 
              onClick={confirmEnable}
            >
              Підтвердити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}