export type TaskPriority = "A" | "B" | "C";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "review"
  | "done"
  | "postponed";

export interface ITaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface ITask {
  id: string;
  order: number;
  section: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  startDate: string | null;
  endDate: string | null;
  comments: ITaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ITasksFile {
  meta: {
    version: number;
    legend: string;
  };
  tasks: ITask[];
}

export type TaskDraft = Pick<
  ITask,
  "section" | "title" | "priority" | "status" | "assignee" | "startDate" | "endDate"
>;

export type TaskPatch = Partial<TaskDraft & Pick<ITask, "order" | "comments">>;
