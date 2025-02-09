
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface AIModel {
  model_name: string;
  model_type: string;
  complexity_threshold: number;
}

export async function selectAIModel(complexity: number): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: models, error } = await supabase
    .from('ai_models')
    .select('*')
    .order('complexity_threshold', { ascending: true });

  if (error) {
    console.error('Error fetching AI models:', error);
    // Default to complex model if there's an error
    return 'gemini-2.0-flash';
  }

  const appropriateModel = models.find(
    (model: AIModel) => complexity < model.complexity_threshold
  );

  // Return the simple model if found, otherwise use the complex model
  return appropriateModel ? appropriateModel.model_name : 'gemini-2.0-flash';
}
