CREATE TABLE public.scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  tipo text NOT NULL DEFAULT 'app',
  titulo text NOT NULL DEFAULT '',
  conteudo text NOT NULL DEFAULT '',
  nome_app text, o_que_faz text, publico text, monetizacao text, objetivo text, estilo text, script_completo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scripts TO authenticated;
GRANT ALL ON public.scripts TO service_role;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.scripts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.scripts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.scripts FOR DELETE TO authenticated USING (auth.uid() = user_id);