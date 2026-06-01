import { useState } from "react";
import api from "@/shared/api/instance.api";
import { toast } from "sonner";

export function useTenderActions(
  tenderId: number,
  nextPrice: number | null,
  price_redemption: number | null // Дозволяємо null тут також
) {
  const [activeModal, setActiveModal] = useState<
    "confirm" | "manual" | "buyout" | null
  >(null);

  const closeModal = () => setActiveModal(null);

  const handleAction = async (payload: any) => {
    // Перевірка ціни (крім ручного введення, де ціна приходить з форми)
    if (payload.ids_redemption_price !== "offer" && !payload.price_proposed) {
      toast.error("Помилка", { description: "Ціна не визначена" });
      return;
    }

    try {
      await api.post("/tender/set-rate", {
        id_tender: tenderId,
        ...payload,
      });

      let actionType = "PLACED_BID";
      if (payload.ids_redemption_price === "redemption") actionType = "PLACED_BID_BUYOUT";
      else if (payload.ids_redemption_price === "offer") actionType = "PLACED_BID_CUSTOM";
      else if (payload.ids_redemption_price === "reduction") actionType = "PLACED_BID_STEP";
      
      try {
        api.post("/activities/track", {
          action: actionType,
          path: `/log/tender/active`,
          metadata: { tenderId, price: payload.price_proposed, type: payload.ids_redemption_price }
        }).catch(() => {});
      } catch(e) {}

      toast.success("Дію виконано успішно");
      closeModal();
      // Тут можна додати refresh логіку
    } catch (error) {
      // Axios interceptor обробить помилку
    }
  };

  const onConfirmReduction = () => {
    if (nextPrice === null) return;
    handleAction({
      ids_redemption_price: "reduction",
      price_proposed: nextPrice,
      notes: "---",
      car_count: 1,
    });
  };

  const onManualPrice = (price: number, notes: string) => {
    handleAction({
      ids_redemption_price: "offer",
      price_proposed: price,
      notes: notes,
      car_count: 1,
    });
  };

  const onBuyout = () => {
    if (price_redemption === null || price_redemption === 0) {
      toast.error("Ціна викупу недоступна");
      return;
    }

    handleAction({
      ids_redemption_price: "redemption",
      price_proposed: price_redemption,
      notes: "Викуп за фіксованою ціною",
      car_count: 1,
    });
  };

  return {
    activeModal,
    setActiveModal,
    closeModal,
    onConfirmReduction,
    onManualPrice,
    onBuyout,
    isPriceAvailable: nextPrice !== null,
    isBuyoutAvailable: price_redemption !== null && price_redemption > 0,
  };
}