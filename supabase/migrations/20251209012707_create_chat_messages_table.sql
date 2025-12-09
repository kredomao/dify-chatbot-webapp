/*
  # Create chat messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `content` (text) - The message content
      - `is_bot` (boolean) - Indicates if the message is from the bot (true) or user (false)
      - `created_at` (timestamptz) - Timestamp when the message was created
  
  2. Security
    - Enable RLS on `messages` table
    - Add policy for anyone to read messages (public chat)
    - Add policy for anyone to insert messages (public chat)
  
  3. Notes
    - Messages are ordered by created_at for chronological display
    - Default value for is_bot is false (user messages)
    - This is a simple public chat, no authentication required for this demo
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  is_bot boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages"
  ON messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON messages
  FOR INSERT
  TO anon
  WITH CHECK (true);