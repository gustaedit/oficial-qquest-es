
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário
const supabaseUrl = 'https://jddsfarngvajjnbetfyb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZHNmYXJuZ3ZhampuYmV0ZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTc2MjQsImV4cCI6MjA4MzEzMzYyNH0.4BrI7HiwBLintjdn7xqEsqAKEI1ekGGXGipWy84MH-g';

export const supabase = createClient(supabaseUrl, supabaseKey);
