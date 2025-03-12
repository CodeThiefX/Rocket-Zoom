import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export async function signInOrSignUp(
  username: string,
  password: string,
  address?: string // Add this parameter
) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!existingUser) {
    if (!address) {
      throw new Error("Wallet address is required for signup");
    }
    // Create new user directly in profiles
    const { data: newUser, error: createError } = await supabase
      .from("profiles")
      .insert([{ username, password, wallet_address: address }])
      .select()
      .single();

    if (createError) throw createError;
    return { user: newUser, isNew: true };
  } else {
    // Verify password
    if (existingUser.password !== password) {
      throw new Error("Invalid password");
    }
    return { user: existingUser, isNew: false };
  }
}
