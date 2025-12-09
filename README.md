# Dify チャットボット Webアプリ

Difyで作成したAIチャットボットと連携するWebアプリケーションです。

## 🚀 機能

- ✅ Dify APIとの連携
- ✅ リアルタイムチャットインターフェース
- ✅ 会話履歴の保存（Supabase）
- ✅ モダンなUI（Tailwind CSS）
- ✅ レスポンシブデザイン

## 📋 必要な環境

- Node.js 18以上
- npm または yarn
- DifyアカウントとAPIキー

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成して、以下の環境変数を設定してください：

```env
VITE_DIFY_API_URL=https://api.dify.ai/v1
VITE_DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
```

**重要**: `.env`ファイルは`.gitignore`に含まれているため、GitHubにコミットされません。

### 3. Supabaseの設定（オプション）

会話履歴を保存する場合は、Supabaseの設定が必要です。

1. [Supabase](https://supabase.com/)でアカウント作成
2. プロジェクトを作成
3. `src/lib/supabase.ts`にSupabaseのURLとAPIキーを設定
4. `supabase/migrations/`のマイグレーションファイルを実行

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 📦 ビルド

本番環境用のビルド：

```bash
npm run build
```

ビルドされたファイルは`dist`フォルダに生成されます。

## 🔧 カスタマイズ

### Dify APIの設定

`src/lib/dify-api.ts`でDify APIの呼び出し方法をカスタマイズできます。

### UIのカスタマイズ

`src/App.tsx`と`src/components/`内のコンポーネントを編集してUIをカスタマイズできます。

## 📝 ライセンス

MIT License
