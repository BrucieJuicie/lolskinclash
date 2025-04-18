// /utils/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { connectDB } from "@/utils/mongodb";
import { User } from "@/models/User";


export const authOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          await connectDB();
  
          const user = await User.findOne({ email: credentials.email });
          if (!user) return null;
  
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) return null;
  
          return {
            id: user._id.toString(),
            username: user.username,           // ✅ include username
            email: user.email
          };
        }
      })
    ],
  
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.username = user.username;      // ✅ persist username in token
        }
        return token;
      },
      async session({ session, token }) {
        if (token?.id) {
          session.user.id = token.id;
          session.user.username = token.username;  // ✅ pass username to session
          session.user.name = token.username;      // Optional: also populate `name`
        }
        return session;
      }
    },
  
    pages: {
      signIn: "/login"
    },
    session: {
      strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
  };
  