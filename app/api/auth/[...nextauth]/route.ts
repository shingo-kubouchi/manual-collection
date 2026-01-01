import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// NextAuthの設定
// データベースなしでJWTセッションを使用
export const authOptions = {
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 環境変数から認証情報を取得（個人利用の場合）
        // 本番環境では、ハッシュ化されたパスワードを環境変数に保存
        const allowedEmail = process.env.ALLOWED_EMAIL;
        const hashedPassword = process.env.HASHED_PASSWORD;

        if (!allowedEmail || !hashedPassword) {
          return null;
        }

        // メールアドレスの確認
        if (credentials.email !== allowedEmail) {
          return null;
        }

        // パスワードの検証（bcryptでハッシュ化されたパスワードと比較）
        const isValid = await bcrypt.compare(
          credentials.password,
          hashedPassword
        );

        if (!isValid) {
          return null;
        }

        // 認証成功
        return {
          id: "1",
          email: credentials.email,
          name: "ユーザー",
        };
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
};

// NextAuthハンドラー
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

