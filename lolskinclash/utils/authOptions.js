///utils/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs"; // [cite: 266]
import { connectDB } from "@/utils/mongodb"; // [cite: 266]
import { User } from "@/models/User"; // [cite: 266]

export const authOptions = {
  providers: [
    CredentialsProvider({ // [cite: 267]
      name: "Credentials", // [cite: 267]
      credentials: {
        email: { label: "Email", type: "text" }, // [cite: 267]
        password: { label: "Password", type: "password" } // [cite: 268]
      },
      async authorize(credentials) { // [cite: 268]
        await connectDB(); // [cite: 268]

        const user = await User.findOne({ email: credentials.email }); // [cite: 268]
        if (!user) return null; // [cite: 269]

        const isValid = await compare(credentials.password, user.password); // [cite: 269]
        if (!isValid) return null; // [cite: 269]

        return { // [cite: 270]
          id: user._id.toString(), // [cite: 270]
          username: user.username, // [cite: 270]
          email: user.email, // [cite: 270]
          avatar: user.avatar, // Added avatar here based on your other file
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { // [cite: 270]
      if (user) {
        token.id = user.id; // [cite: 270]
        token.username = user.username; // [cite: 271]
        token.avatar = user.avatar; // Added avatar here
      }
      return token; // [cite: 271]
    },
    async session({ session, token }) { // [cite: 271]
      if (token?.id) {
        session.user.id = token.id; // [cite: 272]
        session.user.username = token.username; // [cite: 272]
        session.user.name = token.username; // [cite: 272]
        session.user.avatar = token.avatar; // Added avatar here
      }
      return session; // [cite: 272]
    },
  },
  pages: { // [cite: 273]
    signIn: "/login", // [cite: 273]
  },
  session: { // [cite: 273]
    strategy: "jwt", // [cite: 273]
  },
  secret: process.env.NEXTAUTH_SECRET, // [cite: 273]
};