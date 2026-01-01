"use client";

import { useState, useRef, useEffect } from "react";

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void;
  existingImages?: string[];
  maxSize?: number; // MB単位
}

// 画像アップロードコンポーネント
// カメラで撮影するか、ファイルを選択できる
export default function ImageUpload({
  onImageSelect,
  existingImages = [],
  maxSize = 10,
}: ImageUploadProps) {
  const [previewImages, setPreviewImages] = useState<string[]>(existingImages);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 既存画像が変更されたときにプレビューを更新
  useEffect(() => {
    setPreviewImages(existingImages);
  }, [existingImages]);

  // 画像ファイルを選択したときの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const previewUrls: string[] = [];

    // 各ファイルを検証
    for (const file of fileArray) {
      // ファイルタイプのチェック（画像のみ）
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} は画像ファイルではありません`);
        continue;
      }

      // ファイルサイズのチェック
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSize) {
        setError(`${file.name} のサイズが${maxSize}MBを超えています`);
        continue;
      }

      validFiles.push(file);

      // プレビュー用のURLを作成
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        previewUrls.push(result);
        if (previewUrls.length === validFiles.length) {
          setPreviewImages([...existingImages, ...previewUrls]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      onImageSelect(validFiles);
    }
  };

  // 画像を削除
  const handleRemoveImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    // 親コンポーネントにも通知（必要に応じて実装）
  };

  // カメラボタンをクリック
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* ファイル選択ボタン（カメラ対応） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // モバイルでカメラを起動
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* カメラ/ファイル選択ボタン - モダンなデザイン */}
      <button
        type="button"
        onClick={handleCameraClick}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-base flex items-center justify-center gap-2"
      >
        <span className="text-xl">📷</span>
        <span>カメラで撮影 / ファイルを選択</span>
      </button>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* プレビュー画像 */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {previewImages.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 aspect-square">
                <img
                  src={url}
                  alt={`プレビュー ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* オーバーレイ（ホバー時） */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg"
                    aria-label="画像を削除"
                  >
                    <span className="text-xl font-bold">×</span>
                  </button>
                </div>
              </div>
              {/* モバイル用の削除ボタン（常に表示） */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="sm:hidden absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                aria-label="画像を削除"
              >
                <span className="text-sm font-bold">×</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-700">
          <span className="font-semibold">💡 ヒント:</span> モバイルデバイスでは、ボタンをタップするとカメラが起動します。最大{maxSize}MBまでの画像をアップロードできます。
        </p>
      </div>
    </div>
  );
}

