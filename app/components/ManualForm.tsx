"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { ManualFormData } from "@/lib/types";

interface ManualFormProps {
  initialData?: Partial<ManualFormData>;
  manualId?: string;
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
export default function ManualForm({ initialData, manualId }: ManualFormProps) {
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 製品名 */}
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
          製品名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="productName"
          required
          value={formData.製品名}
          onChange={(e) => setFormData({ ...formData, 製品名: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例: iPhone 15 Pro"
        />
      </div>

      {/* 説明書URL */}
      <div>
        <label htmlFor="manualUrl" className="block text-sm font-medium text-gray-700 mb-2">
          説明書URL（任意）
        </label>
        <input
          type="url"
          id="manualUrl"
          value={formData.説明書URL}
          onChange={(e) => setFormData({ ...formData, 説明書URL: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/manual.pdf"
        />
        <p className="mt-1 text-sm text-gray-500">
          ネット上に公開されている説明書のURLがあれば入力してください
        </p>
      </div>

      {/* 説明書画像 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明書画像（任意）
        </label>
        <ImageUpload
          onImageSelect={(files) => setImageFiles([...imageFiles, ...files])}
          existingImages={formData.説明書画像?.map((img) => (typeof img === "string" ? img : URL.createObjectURL(img))) || []}
        />
        <p className="mt-1 text-sm text-gray-500">
          URLがない場合は、説明書を写真で撮影してアップロードできます
        </p>
      </div>

      {/* 購入日 */}
      <div>
        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
          購入日（任意）
        </label>
        <input
          type="date"
          id="purchaseDate"
          value={formData.購入日}
          onChange={(e) => setFormData({ ...formData, 購入日: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリ（任意）
        </label>
        <select
          id="category"
          value={formData.カテゴリ}
          onChange={(e) => setFormData({ ...formData, カテゴリ: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "保存中..." : manualId ? "更新" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

