import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

// デバッグ: 環境変数の読み込み状況を確認（ファイル読み込み時）
// Next.jsは起動時に.env.localを自動的に読み込むが、
// このファイルが読み込まれる時点で環境変数が利用可能か確認
const debugEnvOnLoad = () => {
  if (process.env.NODE_ENV !== "production") {
    const hashedPassword = process.env.HASHED_PASSWORD;
    const allowedEmail = process.env.ALLOWED_EMAIL;
    console.log("[認証] ファイル読み込み時の環境変数:", {
      hasHashedPassword: !!hashedPassword,
      hasAllowedEmail: !!allowedEmail,
      hashedPasswordLength: hashedPassword?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });
  }
};

// 開発環境でのみ実行
if (process.env.NODE_ENV !== "production") {
  debugEnvOnLoad();
}

// NextAuth v5の設定
// データベースなしでJWTセッションを使用
const config = {
  providers: [
    // Google OAuth認証
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // メール/パスワード認証（個人利用向け）
    // 注意: データベースなしの場合、環境変数に1ユーザー分のみ保存
    // 複数ユーザーが必要な場合は、データベースの使用を推奨
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 型を明示的に指定
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;

          if (!email || !password) {
            console.error("[認証] メールアドレスまたはパスワードが提供されていません");
            return null;
          }

          // 環境変数から認証情報を取得（個人利用の場合）
          // 本番環境では、ハッシュ化されたパスワードを環境変数に保存
          const allowedEmail = process.env.ALLOWED_EMAIL;
          // 環境変数から取得
          // Next.jsでは、.env.localの値は自動的にprocess.envに読み込まれる
          // $で始まる値が変数として解釈される問題を回避するため、
          // Base64エンコードされた値もサポート
          let hashedPassword = process.env.HASHED_PASSWORD;
          
          // Base64エンコードされている場合（HASHED_PASSWORD_B64が設定されている場合）
          if (!hashedPassword && process.env.HASHED_PASSWORD_B64) {
            try {
              hashedPassword = Buffer.from(process.env.HASHED_PASSWORD_B64, 'base64').toString('utf-8');
            } catch (error) {
              console.error("[認証] HASHED_PASSWORD_B64のデコードに失敗しました", error);
            }
          }

          // デバッグ: 環境変数の読み込み状況を確認
          console.log("[認証] 環境変数の読み込み状況:", {
            hasEmail: !!allowedEmail,
            hasPassword: !!hashedPassword,
            emailLength: allowedEmail?.length || 0,
            passwordLength: hashedPassword?.length || 0,
            passwordPrefix: hashedPassword?.substring(0, 10) || "未設定",
            // 環境変数のキーを確認（デバッグ用）
            envKeysWithEmail: Object.keys(process.env).filter(key => 
              key.toUpperCase().includes("EMAIL")
            ),
            envKeysWithPassword: Object.keys(process.env).filter(key => 
              key.toUpperCase().includes("PASSWORD")
            ),
            // Next.jsの環境変数の読み込み状況
            nodeEnv: process.env.NODE_ENV,
            nextAuthUrl: process.env.NEXTAUTH_URL ? "設定済み" : "未設定",
          });

          if (!allowedEmail || !hashedPassword) {
            console.error("[認証] 環境変数が設定されていません", {
              hasEmail: !!allowedEmail,
              hasPassword: !!hashedPassword,
              emailValue: allowedEmail ? "設定済み" : "未設定",
              passwordValue: hashedPassword ? "設定済み" : "未設定",
            });
            console.error("[認証] 環境変数の確認方法:");
            console.error("  1. プロジェクトのルートディレクトリに .env.local ファイルがあるか確認");
            console.error("  2. .env.local ファイルに HASHED_PASSWORD=\"$2a$10$...\" が設定されているか確認");
            console.error("  3. 値が $ で始まる場合、引用符（\"）で囲む必要があります");
            console.error("  4. 開発サーバーを再起動してください（環境変数を変更した場合）");
            console.error("  5. .env.local ファイルの構文エラーがないか確認（余分な空白、改行など）");
            return null;
          }

          // メールアドレスの確認（大文字小文字を無視、前後の空白を削除）
          const inputEmail = email.trim().toLowerCase();
          const envEmail = allowedEmail.trim().toLowerCase();

          if (inputEmail !== envEmail) {
            console.error("[認証] メールアドレスが一致しません", {
              input: inputEmail,
              expected: envEmail,
            });
            return null;
          }

          // パスワードの検証（bcryptでハッシュ化されたパスワードと比較）
          // 注意: ログイン画面には元のパスワード（ハッシュ化前）を入力してください
          // HASHED_PASSWORDにはハッシュ化された値を設定してください
          console.log("[認証] パスワード検証開始", {
            hashedPasswordLength: hashedPassword.length,
            hashedPasswordPrefix: hashedPassword.substring(0, 10) + "...",
          });
          
          const isValid = await bcrypt.compare(password, hashedPassword);

          if (!isValid) {
            console.error("[認証] パスワードが一致しません", {
              hint: "ログイン画面には元のパスワード（ハッシュ化前）を入力してください",
              hashedPasswordInEnv: "HASHED_PASSWORDにはハッシュ化された値を設定してください",
            });
            return null;
          }

          // 認証成功
          console.log("[認証] 認証成功", { email });
          return {
            id: "1",
            email: email,
            name: "ユーザー",
          };
        } catch (error) {
          console.error("[認証] エラーが発生しました", error);
          return null;
        }
      },
    }),
  ],
  // JWTセッションを使用（データベース不要）
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7日間（秒単位）
  },
  // コールバック関数
  callbacks: {
    // JWTトークンにユーザー情報を追加
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    // セッションにユーザー情報を追加
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
  },
  // ページのカスタマイズ
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // セキュリティ設定
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

// NextAuth v5の初期化
export const { handlers, auth, signIn, signOut } = NextAuth(config);

