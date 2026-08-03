import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getTasks, mutateTasks } from "@/shared/server/tasks-store";
import { requireAdmin } from "@/shared/server/requireAdmin";
import { ITask } from "@/features/admin/tasks/types/task.type";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const data = await getTasks();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[tasks] GET", error);
    return NextResponse.json(
      { error: "Не вдалося прочитати файл завдань" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();

    if (!body?.title?.trim()) {
      return NextResponse.json(
        { error: "Поле «Завдання» обовʼязкове" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const created = await mutateTasks<ITask>((tasks) => {
      const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order), 0);

      const task: ITask = {
        id: randomUUID(),
        order: maxOrder + 1,
        section: body.section?.trim() || "Інше",
        title: body.title.trim(),
        priority: body.priority ?? "A",
        status: body.status ?? "not_started",
        assignee: body.assignee?.trim() || "",
        startDate: body.startDate || null,
        endDate: body.endDate || null,
        comments: [],
        createdAt: now,
        updatedAt: now,
      };

      return { tasks: [...tasks, task], result: task };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[tasks] POST", error);
    return NextResponse.json(
      { error: "Не вдалося створити завдання" },
      { status: 500 },
    );
  }
}
