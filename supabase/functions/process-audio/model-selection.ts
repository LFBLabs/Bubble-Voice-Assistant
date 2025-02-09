
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface AIModel {
  model_name: string;
  model_type: string;
  complexity_threshold: number;
}

export async function selectAIModel(complexity: number): Promise<string> {
  // Always return the Flash model regardless of complexity
  return 'gemini-2.0-flash';
}
