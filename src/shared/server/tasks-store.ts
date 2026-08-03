import fs from "fs/promises";
import path from "path";
import { ITask, ITasksFile } from "@/features/admin/tasks/types/task.type";

/**
 * Локальне файлове сховище завдань проєкту — без БД.
 * Файл лежить поза src/, щоб запис не тригерив hot-reload у dev.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "tasks.json");
const TMP_PATH = `${FILE_PATH}.tmp`;

const EMPTY_FILE: ITasksFile = {
  meta: { version: 1, legend: "БД — база даних; ТП — тендерна платформа" },
  tasks: [],
};

/**
 * Черга записів. Route handlers одного інстансу Next виконуються конкурентно,
 * тож без серіалізації два одночасні PATCH перетирали б один одного.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

const enqueue = <T>(job: () => Promise<T>): Promise<T> => {
  const result = writeQueue.then(job, job);
  writeQueue = result.catch(() => undefined);
  return result;
};

async function readFile(): Promise<ITasksFile> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<ITasksFile>;

    return {
      meta: parsed.meta ?? EMPTY_FILE.meta,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };
  } catch (error: any) {
    // Файлу ще немає — створюємо порожній
    if (error?.code === "ENOENT") {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(FILE_PATH, JSON.stringify(EMPTY_FILE, null, 2), "utf8");
      return { ...EMPTY_FILE, tasks: [] };
    }
    throw error;
  }
}

async function writeFile(data: ITasksFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Пишемо в тимчасовий файл і перейменовуємо — щоб збій посеред запису
  // не залишив побитий JSON
  await fs.writeFile(TMP_PATH, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(TMP_PATH, FILE_PATH);
}

export async function getTasks(): Promise<ITasksFile> {
  const data = await readFile();
  return {
    ...data,
    tasks: [...data.tasks].sort((a, b) => a.order - b.order),
  };
}

/**
 * Читає файл, віддає його мутатору і зберігає результат — цілком усередині
 * черги, тож read-modify-write атомарний відносно інших викликів.
 */
export function mutateTasks<T>(
  mutator: (tasks: ITask[]) => { tasks: ITask[]; result: T },
): Promise<T> {
  return enqueue(async () => {
    const data = await readFile();
    const { tasks, result } = mutator(data.tasks);
    await writeFile({ ...data, tasks });
    return result;
  });
}
