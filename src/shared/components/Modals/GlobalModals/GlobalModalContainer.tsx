import { RestModal } from "./RestModal";
import { WorkEndModal } from "./WorkEndModal";

export const GlobalModalContainer = ({ type, props, close }: any) => {
  const components: Record<string, any> = {
    rest: RestModal,
    workEnd: WorkEndModal, // додаємо сюди
    // confirm: ConfirmModal,
  };

  const Component = components[type];
  if (!Component) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop - тепер без onClick */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        // onClick={close}  <-- Цей рядок видалено
      />

      {/* Контейнер для контенту */}
      <div className="relative z-[100000] w-full max-w-sm animate-in zoom-in-95 duration-300">
        {/* Передаємо функцію close всередину компонента */}
        <Component {...props} close={close} />
      </div>
    </div>
  );
};
