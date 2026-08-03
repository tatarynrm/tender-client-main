import { NextRequest, NextResponse } from "next/server";
import { mutateTasks } from "@/shared/server/tasks-store";
import { requireAdmin } from "@/shared/server/requireAdmin";
import { ITask } from "@/features/admin/tasks/types/task.type";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string; commentId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, commentId } = await params;

  try {
    const body = await req.json();

    if (!body?.text?.trim()) {
      return NextResponse.json(
        { error: "Коментар не може бути порожнім" },
        { status: 400 },
      );
    }

    const text = body.text.trim();
    const now = new Date().toISOString();

    const updated = await mutateTasks<ITask | null>((tasks) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return { tasks, result: null };

      const comment = tasks[index].comments.find((c) => c.id === commentId);
      if (!comment) return { tasks, result: null };

      const next = [...tasks];
      next[index] = {
        ...next[index],
        comments: next[index].comments.map((c) =>
          c.id === commentId ? { ...c, text, editedAt: now } : c,
        ),
        updatedAt: now,
      };

      return { tasks: next, result: next[index] };
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Завдання або коментар не знайдено" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[tasks] PATCH comment", error);
    return NextResponse.json(
      { error: "Не вдалося оновити коментар" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, commentId } = await params;

  try {
    const updated = await mutateTasks<ITask | null>((tasks) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return { tasks, result: null };

      const next = [...tasks];
      next[index] = {
        ...next[index],
        comments: next[index].comments.filter((c) => c.id !== commentId),
        updatedAt: new Date().toISOString(),
      };

      return { tasks: next, result: next[index] };
    });

    if (!updated) {
      return NextResponse.json({ error: "Завдання не знайдено" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[tasks] DELETE comment", error);
    return NextResponse.json(
      { error: "Не вдалося видалити коментар" },
      { status: 500 },
    );
  }
}
