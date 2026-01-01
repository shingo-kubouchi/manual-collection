"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Manual } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

// 説明書一覧表示コンポーネント
export default function ManualList() {
  const router = useRouter();
  const { data: session } = useSession();
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
      <div className="flex flex-col justify-center items-center py-16 sm:py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-gray-500 text-sm sm:text-base">読み込み中...</div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-medium mb-1">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // データがない場合
  if (manuals.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-6xl sm:text-7xl mb-6">📚</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            説明書がまだ登録されていません
          </h2>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">
            最初の説明書を追加して、管理を始めましょう
          </p>
          {session ? (
            <button
              onClick={() => router.push("/add")}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
            >
              + 最初の説明書を追加
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              説明書を追加するにはログインが必要です
            </p>
          )}
        </div>
      </div>
    );
  }

  // 一覧表示
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {manuals.map((manual, index) => (
        <div
          key={manual.id}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
          style={{
            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
          }}
        >
          {/* 製品名 */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2">
            {manual.製品名}
          </h3>

          {/* 説明書URLまたは画像 */}
          <div className="mb-4">
            {manual.説明書URL ? (
              <a
                href={manual.説明書URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <span>📄</span>
                <span>説明書を開く</span>
              </a>
            ) : manual.説明書画像 && manual.説明書画像.length > 0 ? (
              <div className="space-y-2">
                {manual.説明書画像.slice(0, 2).map((imgUrl, index) => (
                  <div key={index} className="relative overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={imgUrl}
                      alt={`説明書 ${index + 1}`}
                      className="w-full h-32 sm:h-40 object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
                {manual.説明書画像.length > 2 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{manual.説明書画像.length - 2}枚の画像
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">説明書なし</p>
              </div>
            )}
          </div>

          {/* メタ情報 */}
          <div className="space-y-2 mb-4">
            {manual.カテゴリ && (
              <div className="inline-block">
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                  {manual.カテゴリ}
                </span>
              </div>
            )}
            {manual.購入日 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📅</span>
                <span>{formatDate(manual.購入日)}</span>
              </div>
            )}
            <div className="text-xs text-gray-400">
              作成: {formatDate(manual.作成日)}
            </div>
          </div>

          {/* アクションボタン（ログイン済みの場合のみ表示） */}
          {session && (
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => router.push(`/edit/${manual.id}`)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm font-medium"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(manual.id)}
                disabled={deletingId === manual.id}
                className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-sm font-medium"
              >
                {deletingId === manual.id ? "削除中..." : "削除"}
              </button>
            </div>
          )}
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

