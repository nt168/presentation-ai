import { env } from "@/env";
import {
  type AppConfig,
  type ImageModelOption,
  type LocalLLMConfig,
} from "@/types/app-config";
import fs from "node:fs/promises";
import path from "node:path";

function formatDisplayName(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .split(/[-_\s]+/u)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

const DEFAULT_IMAGE_MODELS: ImageModelOption[] = [
  {
    id: "black-forest-labs/FLUX.1-schnell-Free",
    label: "FLUX Fast",
    source: "remote",
  },
  {
    id: "black-forest-labs/FLUX.1-dev",
    label: "FLUX Developer",
    source: "remote",
  },
  {
    id: "black-forest-labs/FLUX1.1-pro",
    label: "FLUX Premium",
    source: "remote",
  },
];

function normalizeServerAddress(server: string | null | undefined): string | null {
  if (!server) return null;
  const trimmed = server.trim();
  if (!trimmed) return null;
  const sanitized = trimmed.replace(/0\.0\.0\.0/u, "127.0.0.1");
  if (sanitized.startsWith("http://") || sanitized.startsWith("https://")) {
    return sanitized;
  }

  return `http://${sanitized}`;
}

export async function loadLocalLLMConfig(): Promise<LocalLLMConfig | null> {
  const providerId = env.LOC_LLM_NAME?.trim();
  if (!providerId) {
    return null;
  }

  const configPath = path.join(
    process.cwd(),
    ".envator",
    "local",
    providerId,
    "conf",
  );

  let fileContent: string | null = null;
  try {
    fileContent = await fs.readFile(configPath, "utf-8");
  } catch (error) {
    console.warn(
      `[config] Unable to read local LLM config at ${configPath}:`,
      error,
    );
  }

  const serverMatch = fileContent?.match(/server\s*=\s*"(?<value>[^"]*)"/u);
  const commandMatch = fileContent?.match(/models\s*=\s*"(?<value>[^"]*)"/u);

  const server = serverMatch?.groups?.value ?? null;
  const httpUrl = normalizeServerAddress(server);

  return {
    providerId,
    displayName: formatDisplayName(providerId) || providerId,
    configPath,
    server,
    httpUrl,
    command: {
      models: commandMatch?.groups?.value ?? null,
    },
  } satisfies LocalLLMConfig;
}

function resolveImageModels(): {
  models: ImageModelOption[];
  remoteModelId: string | null;
  localModelId: string | null;
} {
  const remoteModelId = env.RMT_IM_NAME?.trim() || null;
  const localModelId = env.LOC_IM_NAME?.trim() || null;

  const configuredModels: ImageModelOption[] = [];

  if (remoteModelId) {
    configuredModels.push({
      id: remoteModelId,
      label: remoteModelId,
      source: "remote",
    });
  }

  if (localModelId) {
    configuredModels.push({
      id: localModelId,
      label: localModelId,
      source: "local",
    });
  }

  if (configuredModels.length === 0) {
    return {
      models: DEFAULT_IMAGE_MODELS,
      remoteModelId: DEFAULT_IMAGE_MODELS[0]?.id ?? null,
      localModelId: null,
    };
  }

  return {
    models: configuredModels,
    remoteModelId,
    localModelId,
  };
}

export async function getAppConfig(): Promise<AppConfig> {
  const localConfig = await loadLocalLLMConfig();

  const image = resolveImageModels();

  const remoteEnvRaw = env.RMT_LLM_NAME;
  const remoteNameFromEnv = remoteEnvRaw?.trim();
  const remoteConfig =
    remoteNameFromEnv && remoteNameFromEnv.length > 0
      ? {
          provider: "openai",
          displayName: remoteNameFromEnv,
          isConfigured: true,
        }
      : null;

  return {
    llm: {
      remote: remoteConfig,
      local:
        localConfig ?? {
          providerId: "ollama",
          displayName: "Ollama",
          configPath: path.join(
            process.cwd(),
            ".envator",
            "local",
            "ollama",
            "conf",
          ),
          server: null,
          httpUrl: null,
          command: { models: null },
        },
    },
    image,
  } satisfies AppConfig;
}

