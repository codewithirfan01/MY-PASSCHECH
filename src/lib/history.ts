import { supabase } from "@/lib/supabase";

export interface SaveHistoryInput {
  check_type: "password" | "email";
  result_summary: string;
}

export async function saveCheckHistory(input: SaveHistoryInput): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return;

  await supabase.from("check_history").insert({
    user_id: data.user.id,
    check_type: input.check_type,
    result_summary: input.result_summary,
  });
}
