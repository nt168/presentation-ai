export interface LocalLLMCommandConfig {
  models?: string | null;
}

export interface LocalLLMConfig {
  providerId: string;
  displayName: string;
  configPath: string;
  server?: string | null;
  httpUrl?: string | null;
  command?: LocalLLMCommandConfig;
}

export interface ImageModelOption {
  id: string;
  label: string;
  source: "remote" | "local";
}

export interface AppConfig {
  llm: {
    remote: {
      provider: string;
      displayName: string;
    };
    local: LocalLLMConfig | null;
  };
  image: {
    models: ImageModelOption[];
    remoteModelId: string | null;
    localModelId: string | null;
  };
}
