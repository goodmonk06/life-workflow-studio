# Life Workflow Studio

個人用ワークフロー自動化スタジオ - n8n/Zapierタイプのビジュアルワークフローエディタ

## 概要

Life Workflow Studioは、ブラウザ上でノード＆エッジのワークフローをドラッグ&ドロップで作成・実行できる個人用自動化ツールです。

### 主な機能

- 🎨 **ビジュアルエディタ**: React Flowベースの直感的なノードエディタ
- ⚡ **豊富なノード**: Trigger、Action、Utilityの3カテゴリ
- 🤖 **LLM統合**: OpenAI APIを使用したAI処理ノード
- ⏰ **Cronスケジューラ**: 定期実行のサポート
- 📊 **実行ログ**: ワークフロー実行の詳細な記録
- 🔄 **拡張性**: 将来的に他のプロジェクトと連携可能

### サポートされるノード種別

#### Trigger (トリガー)
- **Manual Trigger**: 手動でワークフローを開始
- **Cron Trigger**: スケジュールに基づいて自動実行

#### Action (アクション)
- **HTTP Request**: HTTPリクエストを送信
- **Notification**: 通知を送信（Slack、Email、Webhook）
- **LLM Action**: OpenAI APIでテキスト生成

#### Utility (ユーティリティ)
- **Delay**: 指定時間待機
- **Branch**: 条件分岐

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **ワークフローエディタ**: React Flow (@xyflow/react)
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **AI**: OpenAI API
- **スケジューラ**: node-cron

## セットアップ

### 前提条件

- Node.js 20以上
- PostgreSQL 14以上
- OpenAI APIキー（LLMノード使用時）

### インストール手順

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd life-workflow-studio
```

2. 依存関係をインストール:
```bash
npm install
```

3. 環境変数を設定:
```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下を設定:
```
DATABASE_URL="postgresql://username:password@localhost:5432/life_workflow_studio"
OPENAI_API_KEY="sk-..."
```

4. データベースをセットアップ:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. 開発サーバーを起動:
```bash
npm run dev
```

6. (オプション) Cronワーカーを起動:
```bash
npm run worker
```

アプリケーションは http://localhost:3000 で起動します。

## 使い方

### ワークフローの作成

1. http://localhost:3000 にアクセス
2. 「新規作成」ボタンをクリック
3. ワークフロー名を入力して作成
4. スタジオページでノードを追加・編集

### ノードの追加

1. 左サイドバーからノードを選択してクリック
2. キャンバスにノードが追加される
3. ノードをドラッグして配置
4. ノードをクリックして右パネルで設定を編集

### ノードの接続

1. ノードの下部（出力ハンドル）をドラッグ
2. 別のノードの上部（入力ハンドル）にドロップ
3. エッジ（線）で接続される

### 変数の使用

前のノードの出力を参照するには、`{{nodeId.field}}`の形式を使用:

```
例: {{http-request-1.data.message}}
```

### ワークフローの実行

1. 「保存」ボタンで保存
2. 「テスト実行」ボタンで即座に実行
3. Cronトリガーを使用している場合、ワーカーが自動実行

## チュートリアル: 毎朝のタスクリスト通知

このチュートリアルでは、毎朝9時にSlackへ「今日やることリスト」を送るワークフローを作成します。

### ステップ1: ワークフローの作成

1. ワークフロー一覧ページで「新規作成」をクリック
2. 名前: `朝のタスクリスト通知`
3. 「作成」をクリック

### ステップ2: Cronトリガーの追加

1. 左サイドバーから「Cron Trigger」をクリック
2. 右パネルで設定:
   - Schedule: `0 9 * * *` (毎日9時)
   - Timezone: `Asia/Tokyo`

### ステップ3: LLMノードでタスクリスト生成

1. 左サイドバーから「LLM Action」をクリック
2. Cron Triggerノードと接続
3. 右パネルで設定:
   - Model: `gpt-4o-mini`
   - System Prompt: `あなたは生産的なアシスタントです。`
   - Prompt:
     ```
     今日の日付: {{trigger.timestamp}}

     今日やるべきタスクのリストを3つ提案してください。
     簡潔に箇条書きで出力してください。
     ```
   - Temperature: `0.7`

### ステップ4: Notificationノードで通知

1. 左サイドバーから「Notification」をクリック
2. LLM Actionノードと接続
3. 右パネルで設定:
   - Channel: `slack`
   - Recipient: `#general`
   - Title: `今日のタスクリスト`
   - Message: `{{llm-action-1.output}}`

### ステップ5: 保存と実行

1. 「保存」ボタンをクリック
2. 「テスト実行」で動作確認
3. ターミナルで `npm run worker` を実行してスケジューラを起動

これで、毎朝9時にAI生成されたタスクリストがSlackに届きます！

## プロジェクト構造

```
life-workflow-studio/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── workflows/        # ワークフローCRUD
│   │   └── runs/             # 実行ログ
│   ├── studio/[workflowId]/  # エディタページ
│   └── workflows/            # 一覧ページ
├── components/               # Reactコンポーネント
│   └── workflow-editor/      # エディタコンポーネント
├── engine/                   # 実行エンジン
│   ├── executor.ts           # メインエグゼキューター
│   └── nodes/                # ノード実装
├── prisma/                   # Prismaスキーマ
├── scripts/                  # ユーティリティスクリプト
│   └── cron-worker.ts        # Cronワーカー
├── types/                    # TypeScript型定義
└── lib/                      # ユーティリティ
```

## データベーススキーマ

### Workflow
- id: ワークフローID
- name: 名前
- description: 説明
- graphJson: ノード・エッジ定義（JSON）
- isActive: アクティブ状態
- createdAt, updatedAt: タイムスタンプ

### WorkflowRun
- id: 実行ID
- workflowId: ワークフローID
- status: 実行状態（running, completed, failed）
- startedAt, finishedAt: 実行時間
- error: エラーメッセージ

### WorkflowRunLog
- id: ログID
- runId: 実行ID
- nodeId: ノードID
- nodeName: ノード名
- status: ステータス（running, success, error）
- outputJson: 出力データ（JSON）
- error: エラーメッセージ
- createdAt: 作成日時

## 開発

### Prismaコマンド

```bash
# Prisma Clientを生成
npm run prisma:generate

# マイグレーションを実行
npm run prisma:migrate

# Prisma Studioを起動
npm run prisma:studio
```

### デバッグ

ワークフロー実行のログは、WorkflowRunLogテーブルに保存されます。
Prisma Studioで確認可能:

```bash
npm run prisma:studio
```

## 今後の拡張計画

- [ ] より多くのノード種別（Database、File操作、など）
- [ ] `automation-recipes-library`との連携
- [ ] `unified-notification-hub`との統合
- [ ] ワークフローテンプレート
- [ ] 実行履歴の可視化
- [ ] エラーリトライ機能
- [ ] Webhook Trigger
- [ ] 条件分岐の高度化（式評価ライブラリ）

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します！
