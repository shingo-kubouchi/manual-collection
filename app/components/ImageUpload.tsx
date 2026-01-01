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
      <div className="flex flex-col sm:flex-row gap-4">
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

        {/* カメラ/ファイル選択ボタン */}
        <button
          type="button"
          onClick={handleCameraClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          📷 カメラで撮影 / ファイルを選択
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* プレビュー画像 */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`プレビュー ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ヒント */}
      <p className="text-sm text-gray-500">
        モバイルデバイスでは、ボタンをタップするとカメラが起動します。
        最大{maxSize}MBまでの画像をアップロードできます。
      </p>
    </div>
  );
}

