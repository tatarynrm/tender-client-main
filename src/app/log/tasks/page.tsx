"use client";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

// Типи для наших даних
type Status = "todo" | "in-progress" | "done";
type TasksState = Record<Status, string[]>;

// Компонент одного елемента (завдання)
function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors"
    >
      Task {id}
    </div>
  );
}

// Компонент колонки
function Column({ id, tasks }: { id: Status; tasks: string[] }) {
  return (
    <div className="flex flex-col flex-1 bg-gray-100 p-4 rounded-xl min-h-[500px]">
      <h2 className="font-bold mb-4 uppercase text-gray-600 text-sm tracking-wider">
        {id.replace("-", " ")}
      </h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {tasks.map((taskId) => (
            <SortableItem key={taskId} id={taskId} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<TasksState>({
    todo: ["1", "2", "3"],
    "in-progress": ["4", "5"],
    done: ["6"],
  });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Функція для знаходження колонки, в якій знаходиться елемент
  const findContainer = (id: string) => {
    if (id in tasks) return id as Status;
    return Object.keys(tasks).find((key) =>
      tasks[key as Status].includes(id)
    ) as Status;
  };

  // Логіка під час перетягування (зміна колонок)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setTasks((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.indexOf(active.id as string);
      const overIndex = overItems.indexOf(overId as string);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => item !== active.id),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex),
        ],
      };
    });
  };

  // Логіка завершення перетягування (сортування всередині колонки)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = tasks[activeContainer].indexOf(active.id as string);
      const overIndex = tasks[overContainer].indexOf(overId as string);

      if (activeIndex !== overIndex) {
        setTasks((prev) => ({
          ...prev,
          [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
        }));
      }
    }
  };

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="flex gap-6 max-w-6xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Column id="todo" tasks={tasks.todo} />
          <Column id="in-progress" tasks={tasks["in-progress"]} />
          <Column id="done" tasks={tasks.done} />
        </DndContext>
      </div>
    </div>
  );
}