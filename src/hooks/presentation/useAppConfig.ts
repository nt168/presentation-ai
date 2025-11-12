import { type AppConfig } from "@/types/app-config";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_APP_CONFIG: AppConfig = {
  llm: {
    remote: null,
    local: {
      providerId: "ollama",
      displayName: "Ollama",
      configPath: ".envator/local/ollama/conf",
      server: null,
      httpUrl: null,
      command: { models: null },
    },
  },
  image: {
    models: [],
    remoteModelId: null,
    localModelId: null,
  },
};

async function fetchAppConfig(): Promise<AppConfig> {
  const response = await fetch("/api/config", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load app configuration");
  }

  const data = (await response.json()) as AppConfig;
  return data;
}

export function useAppConfig() {
  return useQuery({
    queryKey: ["app-config"],
    queryFn: fetchAppConfig,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    initialData: DEFAULT_APP_CONFIG,
  });
}
