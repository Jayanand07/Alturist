import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Chat will be unavailable."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// ── Types ──────────────────────────────────────────────────────────────────

export type MessageType = "text" | "image" | "file" | "prescription";

export interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;        // Firebase UID
  sender_role: "doctor" | "patient";
  sender_name: string;
  message_type: MessageType;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  is_read: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage bucket "chat-attachments"
 * Returns the public URL.
 */
export async function uploadChatFile(
  consultationId: string,
  file: File
): Promise<string> {
  // SECURITY: Sanitize extension — only allow alphanumeric to prevent path traversal
  const rawExt = file.name.split(".").pop() || "bin";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "");
  const path = `${consultationId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("chat-attachments")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("chat-attachments")
    .getPublicUrl(path);

  return data.publicUrl;
}
