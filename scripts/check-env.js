#!/usr/bin/env node

/**
 * 環境変数の読み込み状況を確認するヘルパースクリプト
 * 使用方法: node scripts/check-env.js
 */

require("dotenv").config({ path: ".env.local" });

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📋 環境変数の確認");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const allowedEmail = process.env.ALLOWED_EMAIL;
const hashedPassword = process.env.HASHED_PASSWORD;

console.log("ALLOWED_EMAIL:");
if (allowedEmail) {
  console.log("  ✅ 設定済み");
  console.log("  値:", allowedEmail);
  console.log("  長さ:", allowedEmail.length);
} else {
  console.log("  ❌ 未設定");
}

console.log("\nHASHED_PASSWORD:");
if (hashedPassword) {
  console.log("  ✅ 設定済み");
  console.log("  長さ:", hashedPassword.length);
  console.log("  先頭10文字:", hashedPassword.substring(0, 10) + "...");
  console.log("  $で始まるか:", hashedPassword.startsWith("$"));
} else {
  console.log("  ❌ 未設定");
  console.log("\n⚠️  設定方法:");
  console.log("  1. node scripts/hash-password.js あなたのパスワード");
  console.log("  2. .env.local に HASHED_PASSWORD=\"ハッシュ化された値\" を追加");
  console.log("  3. 引用符（\"）で囲むことを忘れずに！");
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

