import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Turns a verification link into a verified account, and says the same thing however
 * many times the link is opened.
 *
 * The token used to be deleted on success. That made the second visit report failure,
 * and a second visit is the normal case rather than the exception: the page is a GET, so
 * a reload, a back-navigation, a re-render or a mail client prefetching links all ask
 * for it again. People saw "doğrulandı" and then, a moment later, "geçersiz veya
 * kullanılmış" — for an account that had in fact just been verified.
 *
 * The row is kept now and the account state is what decides the answer. The token stays
 * usable until it expires, which costs nothing: verifying an already-verified account
 * changes nothing.
 */
async function verifyToken(token: string | undefined) {
  if (!token) return { ok: false, message: "Geçersiz doğrulama bağlantısı." };

  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, emailVerified: true } } },
  });
  if (!record) return { ok: false, message: "Geçersiz veya kullanılmış doğrulama bağlantısı." };

  if (record.user.emailVerified) {
    return { ok: true, message: "E-postan zaten doğrulanmış. Giriş yapabilirsin." };
  }

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { ok: false, message: "Doğrulama bağlantısının süresi dolmuş. Tekrar kayıt ol." };
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });

  return { ok: true, message: "E-postan doğrulandı! Artık giriş yapabilirsin." };
}

export default async function VerifyEmailPage(props: PageProps<"/dogrula">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;
  const result = await verifyToken(token);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
          result.ok ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
        }`}
      >
        {result.ok ? "✓" : "✕"}
      </div>
      <h1 className="mt-4 text-xl font-bold text-brand-navy">
        {result.ok ? "Doğrulama başarılı" : "Doğrulama başarısız"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{result.message}</p>

      <Link
        href="/giris"
        className="brand-gradient mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Giriş Yap
      </Link>
    </div>
  );
}
