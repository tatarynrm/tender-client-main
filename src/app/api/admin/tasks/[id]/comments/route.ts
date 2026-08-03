import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mutateTasks } from "@/shared/server/tasks-store";
import { requireAdmin } from "@/shared/server/requireAdmin";
import { ITask, ITaskComment } from "@/features/admin/tasks/types/task.type";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();

    if (!body?.text?.trim()) {
      return NextResponse.json(
        { error: "Коментар не може бути порожнім" },
        { status: 400 },
      );
    }

    const comment: ITaskComment = {
      id: randomUUID(),
      author: body.author?.trim() || "Невідомий автор",
      text: body.text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = await mutateTasks<ITask | null>((tasks) => {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return { tasks, result: null };

      const next = [...tasks];
      next[index] = {
        ...next[index],
        comments: [...next[index].comments, comment],
        updatedAt: comment.createdAt,
      };

      return { tasks: next, result: next[index] };
    });

    if (!updated) {
      return NextResponse.json({ error: "Завдання не знайдено" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error("[tasks] POST comment", error);
    return NextResponse.json(
      { error: "Не вдалося додати коментар" },
      { status: 500 },
    );
  }
}
