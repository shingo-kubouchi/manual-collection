"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Manual } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

// 説明書一覧表示コンポーネント
export default function ManualList() {
  const router = useRouter();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 説明書一覧を取得
  const fetchManuals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/manuals");
      const result: ApiResponse<Manual[]> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "説明書の取得に失敗しました");
      }

      setManuals(result.data || []);
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 説明書を削除
  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/manuals/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<null> = await response.json();
      if (!result.success) {
        throw new Error(result.error || "削除に失敗しました");
      }

      // 一覧を再取得
      await fetchManuals();
    } catch (err: any) {
      alert(err.message || "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // コンポーネントマウント時に一覧を取得
  useEffect(() => {
    fetchManuals();
  }, []);

  // ローディング表示
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // データがない場合
  if (manuals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">説明書がまだ登録されていません</p>
        <button
          onClick={() => router.push("/add")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          最初の説明書を追加
        </button>
      </div>
    );
  }

  // 一覧表示
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {manuals.map((manual) => (
        <div
          key={manual.id}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* 製品名 */}
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {manual.製品名}
          </h3>

          {/* 説明書URLまたは画像 */}
          <div className="mb-4">
            {manual.説明書URL ? (
              <a
                href={manual.説明書URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                📄 説明書を開く
              </a>
            ) : manual.説明書画像 && manual.説明書画像.length > 0 ? (
              <div className="space-y-2">
                {manual.説明書画像.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`説明書 ${index + 1}`}
                    className="w-full h-32 object-cover rounded border border-gray-300"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">説明書なし</p>
            )}
          </div>

          {/* メタ情報 */}
          <div className="space-y-1 text-sm text-gray-600 mb-4">
            {manual.カテゴリ && (
              <div>
                <span className="font-medium">カテゴリ:</span> {manual.カテゴリ}
              </div>
            )}
            {manual.購入日 && (
              <div>
                <span className="font-medium">購入日:</span> {formatDate(manual.購入日)}
              </div>
            )}
            <div className="text-xs text-gray-400">
              作成: {formatDate(manual.作成日)}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/edit/${manual.id}`)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(manual.id)}
              disabled={deletingId === manual.id}
              className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-sm"
            >
              {deletingId === manual.id ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

