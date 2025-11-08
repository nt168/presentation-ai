import { getAppConfig, loadLocalLLMConfig } from "@/lib/config/app-config";
import { NextResponse } from "next/server";

interface OllamaTagResponse {
  models?: Array<{ name?: string }>;
}

export async function GET() {
  const localConfig = await loadLocalLLMConfig();

  if (!localConfig) {
    const fallback = await getAppConfig();
    return NextResponse.json({
      providerId: fallback.llm.local?.providerId ?? null,
      providerLabel: fallback.llm.local?.displayName ?? "Ollama",
      config: fallback.llm.local,
      models: [],
      error: null,
    });
  }

  let models: Array<{ name: string }> = [];
  let error: string | null = null;

  if (localConfig.httpUrl) {
    try {
      const response = await fetch(`${localConfig.httpUrl}/api/tags`, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as OllamaTagResponse;
        if (Array.isArray(data.models)) {
          models = data.models
            .filter((model) => typeof model?.name === "string")
            .map((model) => ({ name: model.name as string }));
        }
      } else {
        error = `Failed to fetch models: ${response.status} ${response.statusText}`;
      }
    } catch (fetchError) {
      error =
        fetchError instanceof Error
          ? fetchError.message
          : "Unknown error fetching local models";
    }
  }

  return NextResponse.json({
    providerId: localConfig.providerId,
    providerLabel: localConfig.displayName,
    config: {
      server: localConfig.server ?? null,
      httpUrl: localConfig.httpUrl ?? null,
      configPath: localConfig.configPath,
      command: localConfig.command ?? { models: null },
    },
    models,
    error,
  });
}

export async function POST() {
  const localConfig = await loadLocalLLMConfig();

  return NextResponse.json(
    {
      success: false,
      message:
        "Local model command dispatch is not yet implemented. Connect the tty WebSocket service to enable live model listing.",
      config: localConfig,
    },
    { status: 501 },
  );
}
