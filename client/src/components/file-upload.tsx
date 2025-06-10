import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ComparisonResult } from "@shared/schema";

interface FileUploadProps {
  onProcessed: (data: ComparisonResult) => void;
  onError: (error: string) => void;
  variant?: "default" | "outline";
}

export default function FileUpload({ onProcessed, onError, variant = "default" }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).slice(0, 5).forEach(file => {
        formData.append('files', file);
      });

      const response = await apiRequest('POST', '/api/process-files', formData);
      return response.json();
    },
    onSuccess: (data: ComparisonResult) => {
      onProcessed(data);
    },
    onError: (error: any) => {
      onError(error.message || "Failed to process files");
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files.length > 5) {
        onError("Maximum 5 files allowed");
        return;
      }
      uploadMutation.mutate(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button 
        onClick={handleClick}
        disabled={uploadMutation.isPending}
        variant={variant}
        className={variant === "default" ? "bg-gray-700 text-white hover:bg-gray-800" : ""}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        Upload JSON Files
      </Button>
    </>
  );
}
