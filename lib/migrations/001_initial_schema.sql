-- Create user_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_likes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  package_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, package_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own likes" 
  ON public.user_likes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes"
  ON public.user_likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.user_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_user_likes_updated_at
BEFORE UPDATE ON public.user_likes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON public.user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_package_id ON public.user_likes(package_id);
