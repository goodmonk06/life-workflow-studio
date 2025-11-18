# Life Workflow Studio

個人用ワークフロー自動化スタジオ - n8n/Zapierタイプのビジュアルワークフローエディタ

## Overview

Life Workflow Studioは、ブラウザ上でノード＆エッジのワークフローをドラッグ&ドロップで作成・実行できる個人用自動化ツールです。

### Key Features

- 🎨 **ビジュアルエディタ**: React Flowベースの直感的なノードエディタ
- ⚡ **豊富なノード**: Trigger、Action、Utilityの3カテゴリ、7種類のノード
- 🤖 **LLM統合**: OpenAI API統合による高度なテキスト処理
- ⏰ **Cronスケジューラ**: 定期実行のサポート
- 📊 **実行ログ**: ワークフロー実行の詳細な記録とデバッグ
- ✅ **型安全**: TypeScript + Zod による完全な型安全性
- 🐳 **Docker対応**: Docker Composeで簡単にローカル環境を構築
- 🧪 **テスト**: Vitest による包括的なテスト

### Supported Node Types

#### Trigger (トリガー)
- **Manual Trigger**: 手動でワークフローを開始
- **Cron Trigger**: スケジュールに基づいて自動実行（cron式対応）

#### Action (アクション)
- **HTTP Request**: RESTful APIへのHTTPリクエスト送信
- **Notification**: マルチチャネル通知（Slack、Email、Webhook）
- **LLM Action**: OpenAI GPT-4o-mini/GPT-4oによるテキスト生成

#### Utility (ユーティリティ)
- **Delay**: 指定時間待機（ミリ秒単位）
- **Branch**: 条件分岐（JavaScriptの式評価）

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Workflow Editor**: React Flow (@xyflow/react)
- **Backend**: Next.js API Routes with Zod validation
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI API
- **Scheduler**: node-cron
- **Testing**: Vitest + Testing Library
- **Container**: Docker + Docker Compose

## Domain Model

### Core Entities

```typescript
Workflow
├── id: string (cuid)
├── name: string
├── description: string?
├── graphJson: JSON (nodes + edges)
├── isActive: boolean
└── runs: WorkflowRun[]

WorkflowRun
├── id: string (cuid)
├── workflowId: string
├── status: 'running' | 'completed' | 'failed'
├── startedAt: DateTime
├── finishedAt: DateTime?
├── error: string?
└── logs: WorkflowRunLog[]

WorkflowRunLog
├── id: string (cuid)
├── runId: string
├── nodeId: string
├── nodeName: string?
├── status: 'running' | 'success' | 'error'
├── outputJson: JSON?
├── error: string?
└── createdAt: DateTime
```

## Getting Started

### Requirements

- Node.js 20以上
- Docker & Docker Compose (推奨)
- または PostgreSQL 14以上（ローカル開発の場合）
- OpenAI APIキー（LLMノード使用時）

### Quick Start with Docker (推奨)

1. **リポジトリをクローン**:
```bash
git clone <repository-url>
cd life-workflow-studio
```

2. **環境変数を設定**:
```bash
cp .env.example .env
```

`.env`ファイルを編集:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/life_workflow_studio?schema=public"
OPENAI_API_KEY="sk-your-openai-api-key"  # Optional: LLM機能を使う場合
```

3. **Docker Composeで起動**:
```bash
# 開発環境（DBのみ）
docker compose -f docker-compose.dev.yml up -d

# 依存関係をインストール
npm install

# Prismaクライアントを生成
npm run db:generate

# マイグレーションを実行
npm run db:migrate

# シードデータを投入
npm run db:seed

# 開発サーバーを起動
npm run dev
```

4. **ブラウザでアクセス**:
```
http://localhost:3000
```

### Production Deployment with Docker

```bash
# 本番環境用イメージをビルド＆起動
docker compose up -d

# アプリケーションが起動
# http://localhost:3000
```

### Local Development (Docker不使用)

1. **PostgreSQLをインストール・起動**

2. **依存関係をインストール**:
```bash
npm install
```

3. **環境変数を設定**:
```bash
cp .env.example .env
# DATABASE_URLを自分のPostgreSQL接続情報に更新
```

4. **データベースをセットアップ**:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. **開発サーバーを起動**:
```bash
npm run dev
```

### Available Scripts

```bash
# 開発
npm run dev              # 開発サーバーを起動（http://localhost:3000）
npm run build            # 本番ビルド
npm run start            # 本番サーバーを起動

# テスト
npm test                 # テストを実行
npm run test:watch       # テストをwatchモードで実行

# データベース
npm run db:generate      # Prisma Clientを生成
npm run db:migrate       # マイグレーションを実行
npm run db:push          # スキーマをDBに反映（開発時）
npm run db:seed          # サンプルデータを投入
npm run db:studio        # Prisma Studioを起動（http://localhost:5555）
npm run db:reset         # DBをリセット（全データ削除）

# その他
npm run lint             # ESLintを実行
npm run worker           # Cronワーカーを起動
```

## Example Flow: Morning Task List

以下は実装済みのエンドツーエンドフローの例です。

### Scenario
毎朝9時にAI生成されたタスクリストをSlackへ送信するワークフロー

### Setup Steps

1. **ワークフローを作成**:
   - http://localhost:3000 にアクセス
   - 「新規作成」をクリック
   - 名前: `朝のタスクリスト通知`

2. **ノードを配置**:
   - **Cron Trigger**: `0 9 * * *` (毎日9時)
   - **LLM Action**: GPT-4o-miniで今日のタスクを生成
   - **Notification**: Slackへ送信

3. **ノードを接続**:
   - Cron Trigger → LLM Action → Notification

4. **設定を保存してテスト実行**:
   ```bash
   # テスト実行
   curl -X POST http://localhost:3000/api/workflows/{workflow-id}/run

   # ログを確認
   npm run db:studio
   ```

### Demo Workflows

シードデータには以下のデモワークフローが含まれています:

1. **Daily Weather Check**: 天気APIからデータを取得して通知
2. **朝のタスクリスト通知**: LLMでタスクを生成してSlack通知
3. **Temperature Alert**: 温度をチェックして条件分岐

デモワークフローを確認:
```bash
# シードデータを投入
npm run db:seed

# ブラウザで確認
open http://localhost:3000
```

## Project Structure

```
life-workflow-studio/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── workflows/        # ワークフローCRUD + 実行
│   │   └── runs/             # 実行ログ取得
│   ├── studio/[workflowId]/  # エディタページ
│   └── workflows/            # 一覧ページ
├── components/               # Reactコンポーネント
│   └── workflow-editor/      # エディタコンポーネント
├── engine/                   # ワークフロー実行エンジン
│   ├── executor.ts           # メインエグゼキューター
│   └── nodes/                # ノード実装
│       ├── base.ts           # ベースクラス
│       ├── triggers.ts       # Triggerノード
│       ├── actions.ts        # Actionノード
│       ├── llm.ts            # LLMノード
│       └── utilities.ts      # Utilityノード
├── lib/                      # ユーティリティ
│   ├── prisma.ts             # Prismaシングルトン
│   ├── api-response.ts       # 統一APIレスポンス
│   └── validations/          # Zodバリデーション
├── prisma/                   # Prismaスキーマ
│   ├── schema.prisma         # DBスキーマ
│   └── seed.ts               # シードスクリプト
├── scripts/                  # ユーティリティスクリプト
│   └── cron-worker.ts        # Cronワーカー
├── tests/                    # テスト
│   ├── validations.test.ts
│   ├── api-response.test.ts
│   └── node-executors.test.ts
├── types/                    # TypeScript型定義
│   └── workflow.ts           # ワークフロー型
├── docker-compose.yml        # 本番環境
├── docker-compose.dev.yml    # 開発環境（DBのみ）
├── Dockerfile                # アプリコンテナ
└── vitest.config.ts          # Vitestコンフィグ
```

## API Endpoints

### Workflows

```bash
GET    /api/workflows           # ワークフロー一覧を取得
POST   /api/workflows           # 新規ワークフローを作成
GET    /api/workflows/:id       # ワークフロー詳細を取得
PUT    /api/workflows/:id       # ワークフローを更新
DELETE /api/workflows/:id       # ワークフローを削除
POST   /api/workflows/:id/run   # ワークフローを実行
```

### Runs

```bash
GET /api/runs/:runId/logs  # 実行ログを取得
```

### API Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "message": "エラーメッセージ",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Variable Interpolation

前のノードの出力を参照するには、`{{nodeId.field}}`の形式を使用:

```javascript
// 例: HTTPレスポンスから値を取得
{{http-request-1.data.temperature}}

// 例: LLMの出力をそのまま使用
{{llm-action-1.output}}

// 例: 変数を使用
{{myVariable}}
```

## Testing

```bash
# 全テストを実行
npm test

# Watchモードで実行
npm run test:watch

# カバレッジを表示
npm test -- --coverage
```

テスト内容:
- ✅ Zodバリデーションスキーマ
- ✅ APIレスポンスユーティリティ
- ✅ ノードエグゼキューター（Delay、Branch）
- ✅ エラーハンドリング

## Debugging

### Prisma Studio

データベースの内容を可視化:

```bash
npm run db:studio
# http://localhost:5555 にアクセス
```

### Workflow Logs

実行ログの確認:

1. Prisma Studioで`WorkflowRunLog`テーブルを表示
2. または、API経由で取得:
   ```bash
   curl http://localhost:3000/api/runs/{runId}/logs
   ```

## Development Tips

### 新しいノードタイプの追加

1. `types/workflow.ts` に型定義を追加
2. `lib/validations/workflow.ts` にバリデーションスキーマを追加
3. `engine/nodes/` に実行ロジックを実装
4. `engine/executor.ts` のexecutorsマップに登録
5. `components/workflow-editor/NodeConfigPanel.tsx` に設定フォームを追加

### Cron式の例

```bash
0 9 * * *       # 毎日9時
*/15 * * * *    # 15分ごと
0 0 * * 1       # 毎週月曜0時
0 0 1 * *       # 毎月1日0時
```

## Future Extensions

- [ ] より多くのノード種別（Database、File操作、など）
- [ ] `automation-recipes-library`との連携
- [ ] `unified-notification-hub`との統合
- [ ] ワークフローテンプレート
- [ ] 実行履歴の可視化ダッシュボード
- [ ] エラーリトライ機能
- [ ] Webhook Trigger
- [ ] 条件分岐の高度化（式評価ライブラリ）
- [ ] マルチテナント対応
- [ ] ワークフローのバージョン管理

## Contributing

プルリクエストを歓迎します！

## License

MIT
