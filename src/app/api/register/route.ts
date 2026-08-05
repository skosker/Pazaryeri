import { NextResponse } from "next/server";
import { registerUser, RegisterError } from "@/lib/register-user";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const user = await registerUser(body);
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof RegisterError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
