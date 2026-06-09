import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { senha } = await req.json().catch(() => ({ senha: "" }));
  if (senha && senha === process.env.DASH_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("ptd_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
