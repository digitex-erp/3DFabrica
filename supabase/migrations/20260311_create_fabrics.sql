-- Create fabrics table
CREATE TABLE IF NOT EXISTS fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT, -- upholstery, curtain, etc.
  url TEXT NOT NULL, -- source image URL
  tiled_url TEXT, -- URL for the tiled/processed texture
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public fabrics are viewable by everyone" 
  ON fabrics FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own fabrics" 
  ON fabrics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fabrics" 
  ON fabrics FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fabrics" 
  ON fabrics FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket if it doesn't exist
-- Note: This might need to be done in the Supabase UI if this SQL is run via a standard client
-- INSERT INTO storage.buckets (id, name, public) VALUES ('fabrics', 'fabrics', true) ON CONFLICT (id) DO NOTHING;
