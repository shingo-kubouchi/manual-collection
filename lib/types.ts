// 説明書のデータ型定義
export interface Manual {
  id: string; // NotionのページID
  製品名: string;
  説明書URL?: string; // 任意のURL
  説明書画像?: string[]; // 画像URLの配列
  購入日?: string; // YYYY-MM-DD形式
  カテゴリ?: string; // カテゴリ名
  作成日: string;
  更新日: string;
}

// フォームで使用する型（画像はFileオブジェクト）
export interface ManualFormData {
  製品名: string;
  説明書URL?: string;
  説明書画像?: File[]; // アップロード前のFileオブジェクト
  購入日?: string;
  カテゴリ?: string;
}

// Notion APIのレスポンス型
export interface NotionPageResponse {
  id: string;
  properties: {
    [key: string]: any;
  };
  created_time: string;
  last_edited_time: string;
}

// APIレスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 認証関連の型定義
export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

