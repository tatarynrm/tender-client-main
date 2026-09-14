export interface ITrainingVideo {
  id: string;
  topic: string;
  title: string;
  description: string;
  originalName: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface ITrainingVideoForm {
  topic: string;
  title: string;
  description: string;
  order?: number;
}

export interface ITrainingStreamToken {
  token: string;
  expiresAt: number;
}
