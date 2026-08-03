import TasksPage from "@/features/admin/tasks/TasksPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Завдання проєкту",
  description: "Робочий список завдань по платформі ICT",
};

export default function AdminTasksPage() {
  return <TasksPage />;
}
