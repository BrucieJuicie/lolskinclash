import NextAuth from "next-auth";
import { authOptions } from "@/utils/authOptions"; // Import the consolidated authOptions

// No local definition of authOptions here anymore

const handler = NextAuth(authOptions); // Use the imported authOptions
export { handler as GET, handler as POST };

//check update
