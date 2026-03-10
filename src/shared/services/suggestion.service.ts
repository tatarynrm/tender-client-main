import api from "@/shared/api/instance.api";

export const suggestionService = {
  async saveSuggestion(notes: string) {
    const { data } = await api.post("/suggestion/save", { notes });
    return data;
  },
};
