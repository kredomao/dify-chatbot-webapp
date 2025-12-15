/*
  # Add conversation and user columns to messages

  1. Changes
    - Add `conversation_id` (text, nullable) to `messages`
    - Add `user_id` (text, nullable) to `messages`

  2. Notes
    - Existingデータはそのまま残ります
    - 会話IDはDifyのconversation_id文字列をそのまま保持します
    - user_idはフロントエンドで生成している一時的なユーザーIDを保持します
*/

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id text;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS user_id text;


