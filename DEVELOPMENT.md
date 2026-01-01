# 開発履歴・ガイドライン

このファイルは、プロジェクトの開発履歴、エラー解決方法、機能追加時のフローを記録します。

## 📋 目次

- [開発フロー](#開発フロー)
- [実装履歴](#実装履歴)
- [エラー解決履歴](#エラー解決履歴)
- [技術スタック](#技術スタック)
- [アーキテクチャ](#アーキテクチャ)

---

## 🚀 開発フロー

### 新機能追加時の手順

1. **要件定義**
   - 機能の目的と要件を明確にする
   - 既存の機能との整合性を確認

2. **設計**
   - データ構造の設計
   - API設計（必要に応じて）
   - UI/UX設計

3. **実装**
   - 型定義の追加（`lib/types.ts`）
   - API Routeの実装（`app/api/`）
   - コンポーネントの実装（`app/components/`）
   - ページの実装（`app/`）

4. **テスト**
   - ローカル環境での動作確認
   - エラーハンドリングの確認

5. **ドキュメント更新**
   - `README.md`の更新
   - `DEVELOPMENT.md`への記録

### バグ修正時の手順

1. **問題の特定**
   - エラーメッセージの確認
   - ログの確認
   - 再現手順の確認

2. **原因の調査**
   - 関連するコードの確認
   - 環境変数の確認
   - 依存関係の確認

3. **修正の実装**
   - 最小限の変更で修正
   - エラーハンドリングの追加

4. **検証**
   - 修正後の動作確認
   - 他の機能への影響確認

5. **記録**
   - `DEVELOPMENT.md`の「エラー解決履歴」に記録

---

## 📝 実装履歴

### 2024年 - 初期実装

#### 基本機能
- ✅ Notion API連携による説明書管理
- ✅ 説明書の追加・編集・削除機能
- ✅ 画像アップロード機能（Base64エンコード）
- ✅ カテゴリと購入日での整理

#### 認証機能
- ✅ NextAuth.js v5対応
- ✅ メール/パスワード認証（個人利用向け）
- ✅ Google OAuth認証（オプション）
- ✅ 認証保護（全ページ）
- ✅ ログイン画面のデフォルトをメール/パスワードに設定

#### 環境変数の問題解決
- ✅ `$`で始まる環境変数（bcryptハッシュ）の読み込み問題をBase64エンコードで解決
- ✅ `HASHED_PASSWORD_B64`を使用

#### Next.js 16対応
- ✅ 動的ルートの`params`を`Promise`型に変更
- ✅ `useSearchParams()`をSuspenseでラップ

#### Vercelデプロイ対応
- ✅ `vercel.json`の作成
- ✅ `public`ディレクトリの作成
- ✅ 環境変数の設定方法をドキュメント化

---

## 🐛 エラー解決履歴

### 1. NextAuth.js v5の`withAuth`エラー

**エラー内容:**
```
Export withAuth doesn't exist in target module
```

**原因:**
- NextAuth.js v5では`withAuth`が削除され、`auth`関数を使用する必要がある

**解決方法:**
- `auth.ts`を作成してNextAuth.js v5の設定を集約
- `middleware.ts`で`auth`関数を使用するように変更
- `app/api/auth/[...nextauth]/route.ts`を簡素化

**参考:**
- `auth.ts`
- `middleware.ts`

---

### 2. 環境変数`HASHED_PASSWORD`が読み込まれない

**エラー内容:**
```
[認証] 環境変数が設定されていません { hasPassword: false }
```

**原因:**
- Next.jsが`$`で始まる環境変数（bcryptハッシュ）を変数として解釈してしまう

**解決方法:**
- Base64エンコードを使用
- `HASHED_PASSWORD_B64`として環境変数に保存
- `auth.ts`で自動的にデコード

**参考:**
- `scripts/encode-env-password.js`
- `auth.ts`（Base64デコード処理）

---

### 3. Next.js 16の型エラー（動的ルート）

**エラー内容:**
```
Type '{ params: { id: string; }; }' is not assignable to type '{ params: Promise<{ id: string; }>; }'
```

**原因:**
- Next.js 16では動的ルートの`params`が非同期（Promise）になった

**解決方法:**
- `app/api/manuals/[id]/route.ts`の`params`を`Promise<{ id: string }>`に変更
- `await params`を使用して値を取得

**参考:**
- `app/api/manuals/[id]/route.ts`

---

### 4. `useSearchParams()`のSuspenseエラー

**エラー内容:**
```
useSearchParams() should be wrapped in a suspense boundary
```

**原因:**
- Next.js 14以降では`useSearchParams()`をSuspenseでラップする必要がある

**解決方法:**
- `app/auth/signin/page.tsx`と`app/auth/error/page.tsx`で`Suspense`でラップ
- フォームコンポーネントを分離して`Suspense`で囲む

**参考:**
- `app/auth/signin/page.tsx`
- `app/auth/error/page.tsx`

---

### 5. Vercelデプロイ時の`public`ディレクトリエラー

**エラー内容:**
```
Error: No Output Directory named "public" found after the Build completed
```

**原因:**
- Vercelが`public`ディレクトリを探していた

**解決方法:**
- `vercel.json`を作成してNext.jsプロジェクトであることを明示
- 空の`public`ディレクトリを作成

**参考:**
- `vercel.json`
- `public/.gitkeep`

---

### 6. 型エラー（`説明書画像`の型不一致）

**エラー内容:**
```
Type 'string[] | undefined' is not assignable to type 'File[] | undefined'
```

**原因:**
- `ManualForm`の`initialData`は`File[]`を期待しているが、編集ページでは`string[]`（URL）を渡していた

**解決方法:**
- `ManualFormProps`に`existingImages?: string[]`を追加
- `initialData`から`説明書画像`を削除
- `ImageUpload`に`existingImages`を直接渡す

**参考:**
- `app/components/ManualForm.tsx`
- `app/edit/[id]/page.tsx`

---

## 🛠 技術スタック

### フロントエンド
- **Next.js 16.1.1** (App Router)
- **React 19.2.3**
- **TypeScript 5.9.3**
- **Tailwind CSS 3.4.19**

### バックエンド
- **Next.js API Routes** (Serverless Functions)
- **NextAuth.js v5** (認証)
- **Notion API** (データベース)

### ホスティング
- **Vercel** (無料枠)

### 認証
- **NextAuth.js v5**
  - メール/パスワード認証（個人利用向け）
  - Google OAuth認証（オプション）
  - JWTセッション（データベース不要）

---

## 🏗 アーキテクチャ

### ディレクトリ構造

```
manual-collection/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js認証エンドポイント
│   │   └── manuals/       # 説明書管理API
│   ├── auth/              # 認証関連ページ
│   ├── components/        # Reactコンポーネント
│   ├── add/               # 説明書追加ページ
│   ├── edit/[id]/         # 説明書編集ページ
│   └── page.tsx           # トップページ（一覧）
├── lib/                   # ユーティリティ
│   ├── notion.ts          # Notion API連携
│   └── types.ts           # 型定義
├── auth.ts                # NextAuth.js設定
├── middleware.ts          # 認証保護ミドルウェア
└── scripts/               # ヘルパースクリプト
```

### データフロー

1. **説明書の追加・編集**
   - ユーザー → `ManualForm` → API Route → Notion API

2. **説明書の取得**
   - ユーザー → `ManualList` → API Route → Notion API

3. **認証**
   - ユーザー → `SignInPage` → NextAuth.js → JWTセッション

### 環境変数

**必須:**
- `NOTION_API_KEY`: Notion Integration Token
- `NOTION_DATABASE_ID`: NotionデータベースID
- `NEXTAUTH_SECRET`: NextAuth.jsのシークレット
- `NEXTAUTH_URL`: アプリケーションのURL

**認証（個人利用向け）:**
- `ALLOWED_EMAIL`: 許可されたメールアドレス
- `HASHED_PASSWORD_B64`: Base64エンコードされたハッシュ化パスワード

**OAuth（オプション）:**
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

---

## 📚 参考資料

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [NextAuth.js公式ドキュメント](https://next-auth.js.org/)
- [Notion API公式ドキュメント](https://developers.notion.com/)
- [Vercel公式ドキュメント](https://vercel.com/docs)

---

## 🔄 更新履歴

- 2024年: 初期実装とデプロイ完了

