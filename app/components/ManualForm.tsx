"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { ManualFormData } from "@/lib/types";

interface ManualFormProps {
  initialData?: Partial<ManualFormData>;
  manualId?: string;
  existingImages?: string[]; // 既存の画像URL（編集時用）
}

// カテゴリの選択肢（必要に応じてカスタマイズ可能）
const CATEGORIES = [
  "家電",
  "家具",
  "食品",
  "衣類",
  "書籍",
  "その他",
];

// 説明書の追加・編集フォームコンポーネント
export default function ManualForm({ initialData, manualId, existingImages = [] }: ManualFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // フォームの状態
  const [formData, setFormData] = useState<ManualFormData>({
    製品名: initialData?.製品名 || "",
    説明書URL: initialData?.説明書URL || "",
    購入日: initialData?.購入日 || "",
    カテゴリ: initialData?.カテゴリ || "",
    説明書画像: initialData?.説明書画像 || [],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // フォーム送信処理
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 画像をアップロード（Base64に変換）
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const base64 = await fileToBase64(file);
        // 実際の実装では、ここでAPIを呼び出してCloudinaryなどにアップロード
        // 現在はBase64データURLをそのまま使用
        imageUrls.push(base64);
      }

      // APIに送信するデータ
      const submitData = {
        製品名: formData.製品名,
        説明書URL: formData.説明書URL || undefined,
        購入日: formData.購入日 || undefined,
        カテゴリ: formData.カテゴリ || undefined,
        説明書画像: imageUrls.length > 0 ? imageUrls : undefined,
      };

      // APIを呼び出し
      if (manualId) {
        // 更新
        const response = await fetch(`/api/manuals/${manualId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "更新に失敗しました");
        }
      } else {
        // 新規作成
        const response = await fetch("/api/manuals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "作成に失敗しました");
        }
      }

      // 成功したら一覧ページに戻る
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ファイルをBase64に変換
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium mb-1">エラーが発生しました</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 製品名 */}
      <div className="space-y-2">
        <label htmlFor="productName" className="block text-sm font-semibold text-gray-700">
          製品名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="productName"
          required
          value={formData.製品名}
          onChange={(e) => setFormData({ ...formData, 製品名: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
          placeholder="例: iPhone 15 Pro"
        />
      </div>

      {/* 説明書URL */}
      <div className="space-y-2">
        <label htmlFor="manualUrl" className="block text-sm font-semibold text-gray-700">
          説明書URL（任意）
        </label>
        <input
          type="url"
          id="manualUrl"
          value={formData.説明書URL}
          onChange={(e) => setFormData({ ...formData, 説明書URL: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
          placeholder="https://example.com/manual.pdf"
        />
        <p className="text-xs sm:text-sm text-gray-500">
          ネット上に公開されている説明書のURLがあれば入力してください
        </p>
      </div>

      {/* 説明書画像 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          説明書画像（任意）
        </label>
        <ImageUpload
          onImageSelect={(files) => setImageFiles([...imageFiles, ...files])}
          existingImages={existingImages}
        />
        <p className="text-xs sm:text-sm text-gray-500">
          URLがない場合は、説明書を写真で撮影してアップロードできます
        </p>
      </div>

      {/* 購入日 */}
      <div className="space-y-2">
        <label htmlFor="purchaseDate" className="block text-sm font-semibold text-gray-700">
          購入日（任意）
        </label>
        <input
          type="date"
          id="purchaseDate"
          value={formData.購入日}
          onChange={(e) => setFormData({ ...formData, 購入日: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
        />
      </div>

      {/* カテゴリ */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
          カテゴリ（任意）
        </label>
        <select
          id="category"
          value={formData.カテゴリ}
          onChange={(e) => setFormData({ ...formData, カテゴリ: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base bg-white"
        >
          <option value="">選択してください</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 送信ボタン */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              保存中...
            </span>
          ) : (
            manualId ? "更新する" : "保存する"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium text-base"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

