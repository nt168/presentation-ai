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
import { Image, Wand2 } from "lucide-react";
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
          {(remoteAiModels.length > 0 || localAiModels.length > 0) && (
            <SelectGroup>
              <SelectLabel className="text-primary/80 flex items-center gap-1">
                <Wand2 size={10} />
                AI Generation
              </SelectLabel>
              {remoteAiModels.length > 0 && (
                <>
                  <SelectLabel className="pt-2 text-xs text-muted-foreground">
                    Remote AI Models
                  </SelectLabel>
                  {remoteAiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </>
              )}
              {localAiModels.length > 0 && (
                <>
                  <SelectLabel className="pt-2 text-xs text-muted-foreground">
                    Local AI Models
                  </SelectLabel>
                  {localAiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectGroup>
          )}
          <SelectGroup>
            <SelectLabel className="text-primary/80 flex items-center gap-1">
              <Image size={10} />
              Stock Images
            </SelectLabel>
            <SelectItem value="stock-unsplash">Unsplash</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
