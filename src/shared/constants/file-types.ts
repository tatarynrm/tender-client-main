import { Accept } from "react-dropzone";

export const ACCEPTED_FILES = {
  images: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'image/svg+xml': ['.svg'],
    'image/heic': ['.heic'],
  } as Accept,

  documents: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
  } as Accept,

  archive: {
    'application/zip': ['.zip'],
    'application/x-7z-compressed': ['.7z'],
    'application/x-rar-compressed': ['.rar'],
    'application/x-tar': ['.tar'],
  } as Accept,

  media: {
    'video/mp4': ['.mp4'],
    'video/quicktime': ['.mov'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
  } as Accept,
};