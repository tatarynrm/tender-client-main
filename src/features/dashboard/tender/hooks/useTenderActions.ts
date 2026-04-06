import api from "@/shared/api/instance.api";
import { toast } from "sonner";
import { useModalStore } from "@/shared/stores/useModalStore";

export function useTenderActions(
  tenderId: number,
  nextPrice: number | null,
  price_redemption: number | null
) {
  const { confirm, closeModal } = useModalStore();

  const handleAction = async (payload: any) => {
    if (payload.ids_redemption_price !== "offer" && !payload.price_proposed) {
      toast.error("Помилка", { description: "Ціна не визначена" });
      return;
    }

    try {
      await api.post("/tender/set-rate", {
        id_tender: tenderId,
        ...payload,
      });
      toast.success("Дію виконано успішно");
      closeModal();
    } catch (error) {
      // Axios interceptor handles errors
    }
  };

  const onConfirmReduction = (notes?: string) => {
    if (nextPrice === null) return;
    handleAction({
      ids_redemption_price: "reduction",
      price_proposed: nextPrice,
      notes: notes || "---",
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
    onConfirmReduction,
    onManualPrice,
    onBuyout,
    isPriceAvailable: nextPrice !== null,
    isBuyoutAvailable: price_redemption !== null && price_redemption > 0,
  };
}