import { NextRequest, NextResponse } from "next/server";
import { getAllManuals, createManual } from "@/lib/notion";
import { ApiResponse } from "@/lib/types";

// GET: すべての説明書を取得
export async function GET() {
  try {
    const manuals = await getAllManuals();
    const response: ApiResponse<typeof manuals> = {
      success: true,
      data: manuals,
    };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || "説明書の取得に失敗しました",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST: 新しい説明書を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 製品名, 説明書URL, 説明書画像, 購入日, カテゴリ } = body;

    // バリデーション: 製品名は必須
    if (!製品名 || typeof 製品名 !== "string" || 製品名.trim() === "") {
      const response: ApiResponse<null> = {
        success: false,
        error: "製品名は必須です",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 説明書を作成
    const manual = await createManual({
      製品名: 製品名.trim(),
      説明書URL,
      説明書画像,
      購入日,
      カテゴリ,
    });

    const response: ApiResponse<typeof manual> = {
      success: true,
      data: manual,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || "説明書の作成に失敗しました",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

