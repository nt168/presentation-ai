"use client";

import { type ImageModelList } from "@/app/_actions/image/generate";
import { useAppConfig } from "@/hooks/presentation/useAppConfig";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo } from "react";

interface ImageSourceSelectorProps {
  imageSource: "ai" | "stock";
  imageModel: ImageModelList;
  stockImageProvider: "unsplash";
  onImageSourceChange: (source: "ai" | "stock") => void;
  onImageModelChange: (model: ImageModelList) => void;
  onStockImageProviderChange: (provider: "unsplash") => void;
  className?: string;
  showLabel?: boolean;
}

export function ImageSourceSelector({
  imageSource,
  imageModel,
  stockImageProvider,
  onImageSourceChange,
  onImageModelChange,
  onStockImageProviderChange,
  className,
  showLabel = true,
}: ImageSourceSelectorProps) {
  const { data: appConfig } = useAppConfig();

  const aiModels = appConfig?.image.models ?? [];
  const remoteModelId = appConfig?.image.remoteModelId ?? null;
  const localModelId = appConfig?.image.localModelId ?? null;
  const remoteAiModels = useMemo(
    () => aiModels.filter((model) => model.source === "remote"),
    [aiModels],
  );
  const localAiModels = useMemo(
    () => aiModels.filter((model) => model.source === "local"),
    [aiModels],
  );

  useEffect(() => {
    if (imageSource !== "ai") {
      return;
    }

    const hasCurrentModel = aiModels.some(
      (model) => model.id === imageModel,
    );

    if (!hasCurrentModel) {
      const fallbackModel = remoteModelId || localModelId || aiModels[0]?.id;

      if (fallbackModel) {
        onImageModelChange(fallbackModel as ImageModelList);
      }
    }
  }, [
    aiModels,
    localModelId,
    remoteModelId,
    imageModel,
    imageSource,
    onImageModelChange,
  ]);

  return (
    <div className={className}>
      {showLabel && (
        <Label className="text-sm font-medium mb-2 block">Image Source</Label>
      )}
      <Select
        value={
          imageSource === "ai"
            ? imageModel || "black-forest-labs/FLUX.1-schnell-Free"
            : `stock-${stockImageProvider}`
        }
        onValueChange={(value) => {
          if (value.startsWith("stock-")) {
            // Handle stock image selection
            const provider = value.replace("stock-", "") as "unsplash";
            onImageSourceChange("stock");
            onStockImageProviderChange(provider);
          } else {
            // Handle AI model selection
            onImageSourceChange("ai");
            onImageModelChange(value as ImageModelList);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select image generation method" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase">
              LOCAL
            </SelectLabel>
            {localAiModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.label || model.id}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase">
              REMOTE
            </SelectLabel>
            {remoteAiModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.label || model.id}
              </SelectItem>
            ))}
            <SelectItem value="stock-unsplash">unsplash</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
