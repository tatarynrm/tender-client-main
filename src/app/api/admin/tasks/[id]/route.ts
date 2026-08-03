import { NextRequest, NextResponse } from "next/server";
import { mutateTasks } from "@/shared/server/tasks-store";
import { requireAdmin } from "@/shared/server/requireAdmin";
import { ITask } from "@/features/admin/tasks/types/task.type";

export const dynamic = "force-dynamic";

/** Поля, які дозволено оновлювати ззовні */
const EDITABLE: (keyof ITask)[] = [
  "section",
  "title",
  "priority",
  "status",
  "assignee",
  "startDate",
  "endDate",
  "order",
];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();

    const patch: Partial<ITask> = {};
    for (const key of EDITABLE) {
      if (key in body) (patch as any)[key] = body[key];
    }

    if (patch.title !== undefined && !String(patch.title).trim()) {
      return NextResponse.json(
        { error: "Поле «Завдання» не може бути порожнім" },
        { status: 400 },
      );
    }

    const updated = await mutateTasks<ITask | null>((tasks) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return { tasks, result: null };

      const next = [...tasks];
      next[index] = {
        ...next[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };

      return { tasks: next, result: next[index] };
    });

    if (!updated) {
      return NextResponse.json({ error: "Завдання не знайдено" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[tasks] PATCH", error);
    return NextResponse.json(
      { error: "Не вдалося оновити завдання" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const removed = await mutateTasks<boolean>((tasks) => {
      const next = tasks.filter((t) => t.id !== id);
      return { tasks: next, result: next.length !== tasks.length };
    });

    if (!removed) {
      return NextResponse.json({ error: "Завдання не знайдено" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tasks] DELETE", error);
    return NextResponse.json(
      { error: "Не вдалося видалити завдання" },
      { status: 500 },
    );
  }
}
