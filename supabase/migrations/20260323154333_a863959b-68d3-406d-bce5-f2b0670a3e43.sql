
-- Polls table for voting system
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view polls" ON public.polls
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator or admin can update polls" ON public.polls
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'master_admin') OR created_by = auth.uid())
  WITH CHECK (has_role(auth.uid(), 'master_admin') OR created_by = auth.uid());

CREATE POLICY "Creator or admin can delete polls" ON public.polls
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin') OR created_by = auth.uid());

-- Poll votes
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_option INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view votes" ON public.poll_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can vote" ON public.poll_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.poll_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Poll comments (before voting discussion)
CREATE TABLE public.poll_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.poll_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view poll comments" ON public.poll_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create poll comments" ON public.poll_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND length(trim(body)) >= 1);

CREATE POLICY "Author or admin can delete poll comments" ON public.poll_comments
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin') OR auth.uid() = author_id);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view chat messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND length(trim(body)) >= 1);

CREATE POLICY "Author or admin can delete messages" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'master_admin') OR auth.uid() = author_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
