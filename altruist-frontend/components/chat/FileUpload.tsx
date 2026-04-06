"use client";

import React, { useRef, useState } from "react";
import { Paperclip, ImageIcon, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadChatFile } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  consultationId: string;
  onFileUploaded: (url: string, fileName: string, type: "image" | "file") => void;
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_FILE_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_FILE_SIZE_MB = 10;

export default function FileUpload({ consultationId, onFileUploaded, disabled }: FileUploadProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File, type: "image" | "file") {
    // SECURITY: Validate file type matches allowed list
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("File type not allowed. Please upload images, PDFs, or Word documents.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadChatFile(consultationId, file);
      onFileUploaded(url, file.name, type);

      if (type === "image") {
        // Show quick preview toast
        toast.success("Image ready to send!");
      } else {
        toast.success(`File "${file.name}" ready to send!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Image picker */}
      <input
        ref={imageRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file, "image");
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full text-gray-500 hover:text-[#0D9488] hover:bg-[#0D9488]/10 transition-colors",
          uploading && "opacity-50"
        )}
        disabled={disabled || uploading}
        onClick={() => imageRef.current?.click()}
        title="Send image"
      >
        <ImageIcon size={18} />
      </Button>

      {/* File picker */}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
            handleFile(file, isImage ? "image" : "file");
          }
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full text-gray-500 hover:text-[#0D9488] hover:bg-[#0D9488]/10 transition-colors",
          uploading && "opacity-50 animate-pulse"
        )}
        disabled={disabled || uploading}
        onClick={() => fileRef.current?.click()}
        title="Send file (PDF, Word)"
      >
        <Paperclip size={18} />
      </Button>
    </div>
  );
}
