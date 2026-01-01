import { NextRequest, NextResponse } from "next/server";
import { getManualById, updateManual, deleteManual } from "@/lib/notion";
import { ApiResponse } from "@/lib/types";

// GET: IDで説明書を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const manual = await getManualById(params.id);
    const response: ApiResponse<typeof manual> = {
      success: true,
      data: manual,
    };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Error:", error);
    
    // セキュリティ: エラーメッセージから機密情報を除外
    let errorMessage = "説明書の取得に失敗しました";
    if (error.message && !error.message.includes("NOTION_API_KEY") && !error.message.includes("DATABASE_ID")) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH: 説明書を更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 製品名, 説明書URL, 説明書画像, 購入日, カテゴリ } = body;

    // 更新データを構築（undefinedのフィールドは更新しない）
    const updateData: any = {};
    if (製品名 !== undefined) updateData.製品名 = 製品名;
    if (説明書URL !== undefined) updateData.説明書URL = 説明書URL;
    if (説明書画像 !== undefined) updateData.説明書画像 = 説明書画像;
    if (購入日 !== undefined) updateData.購入日 = 購入日;
    if (カテゴリ !== undefined) updateData.カテゴリ = カテゴリ;

    const manual = await updateManual(params.id, updateData);
    const response: ApiResponse<typeof manual> = {
      success: true,
      data: manual,
    };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Error:", error);
    
    // セキュリティ: エラーメッセージから機密情報を除外
    let errorMessage = "説明書の更新に失敗しました";
    if (error.message && !error.message.includes("NOTION_API_KEY") && !error.message.includes("DATABASE_ID")) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE: 説明書を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteManual(params.id);
    const response: ApiResponse<null> = {
      success: true,
    };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Error:", error);
    
    // セキュリティ: エラーメッセージから機密情報を除外
    let errorMessage = "説明書の削除に失敗しました";
    if (error.message && !error.message.includes("NOTION_API_KEY") && !error.message.includes("DATABASE_ID")) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

