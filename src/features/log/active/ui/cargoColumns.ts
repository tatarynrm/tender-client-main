/**
 * Ширини колонок списку заявок — спільні для шапки (CargoList) і полоски (CargoRow),
 * щоб вони не розʼїжджались.
 *
 * Полоски вмикаються від 1000px; нижче рядок розкладається у стовпчик
 * (планшет/телефон), тому ширини задані лише з `min-[1000px]`.
 * На великих екранах (xl) колонки трохи ширші — стає менше переносів.
 */
export const CARGO_COL = {
  id: "min-[1000px]:w-[48px] xl:w-[56px] flex-shrink-0",
  from: "flex-1 min-[1000px]:min-w-[110px] xl:min-w-[150px]",
  to: "flex-1 min-[1000px]:min-w-[110px] xl:min-w-[150px]",
  transport: "min-[1000px]:w-[92px] xl:w-[100px] flex-shrink-0",
  price: "min-[1000px]:w-[104px] xl:w-[120px] flex-shrink-0",
  cars: "min-[1000px]:w-[104px] xl:w-[110px] flex-shrink-0",
  info: "flex-1 min-[1000px]:min-w-[110px] xl:min-w-[150px]",
  manager: "min-[1000px]:w-[120px] xl:w-[140px] flex-shrink-0",
  actions: "min-[1000px]:w-[132px] xl:w-[216px] flex-shrink-0",
} as const;

export const CARGO_COLUMNS: { label: string; className: string }[] = [
  { label: "№", className: CARGO_COL.id },
  { label: "Завантаження", className: CARGO_COL.from },
  { label: "Розвантаження", className: CARGO_COL.to },
  { label: "Транспорт", className: CARGO_COL.transport },
  { label: "Ціна", className: CARGO_COL.price },
  { label: "Авто", className: CARGO_COL.cars },
  { label: "Інформація", className: CARGO_COL.info },
  { label: "Менеджер", className: CARGO_COL.manager },
  { label: "Дії", className: CARGO_COL.actions },
];
