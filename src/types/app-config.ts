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

export interface RemoteLLMConfig {
  provider: string;
  displayName: string;
  isConfigured: boolean;
}

export interface AppConfig {
  llm: {
    remote: RemoteLLMConfig | null;
    local: LocalLLMConfig | null;
  };
  image: {
    models: ImageModelOption[];
    remoteModelId: string | null;
    localModelId: string | null;
  };
}
