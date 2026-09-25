import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { budgetLabel, isOpen, offerUsage, shortName, timeAgo } from "@/lib/job-requests";
import { OfferForm } from "./offer-form";
import { withdrawOfferAction } from "../actions";

async function load(id: string) {
  return prisma.jobRequest.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, budgetMin: true, budgetMax: true, deliveryDays: true,
      status: true, expiresAt: true, createdAt: true, buyerId: true, categoryId: true,
      category: { select: { name: true, slug: true } },
      buyer: { select: { name: true } },
      _count: { select: { offers: { where: { status: { not: "WITHDRAWN" } } } } },
    },
  });
}

export async function generateMetadata(props: PageProps<"/is-talepleri/[id]">): Promise<Metadata> {
  const r = await load((await props.params).id);
  return r && r.status !== "REMOVED" ? { title: r.title, description: r.description.slice(0, 160) } : {};
}

export default async function JobRequestPage(props: PageProps<"/is-talepleri/[id]">) {
  const { id } = await props.params;
  const [settings, session, request] = await Promise.all([getSettings(), auth(), load(id)]);
  const isAdmin = session?.user?.role === "ADMIN";
  if (!request || ((request.status === "REMOVED" || !settings.jobRequestsEnabled) && !isAdmin)) notFound();

  const open = isOpen(request);
  const user = session?.user ?? null;
  const isOwner = user?.id === request.buyerId;
  const isFreelancer = user?.role === "FREELANCER" && !isOwner;

  const [gigs, myOffer, usage] = isFreelancer
    ? await Promise.all([
        prisma.gig.findMany({
          where: { sellerId: user!.id, published: true, status: "APPROVED" },
          select: { id: true, title: true, categoryId: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.jobOffer.findUnique({ where: { requestId_sellerId: { requestId: id, sellerId: user!.id } } }),
        offerUsage(user!.id),
      ])
    : [[], null, null];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/is-talepleri" className="hover:text-slate-600">İş Talepleri</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/is-talepleri?kategori=${request.category.slug}`} className="hover:text-slate-600">
          {request.category.name}
        </Link>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-brand-navy sm:text-2xl">{request.title}</h1>
          {!open && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              {request.status === "HIRED" ? "Freelancer seçildi" : "Teklif almıyor"}
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase text-slate-400">Bütçe</p>
            <p className="font-semibold text-brand-navy">{budgetLabel(request.budgetMin, request.budgetMax)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase text-slate-400">Teslim</p>
            <p className="font-semibold text-brand-navy">{request.deliveryDays} gün</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase text-slate-400">Teklif</p>
            <p className="font-semibold text-brand-navy">{request._count.offers}</p>
          </div>
        </div>
        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{request.description}</p>
        <p className="mt-4 text-xs text-slate-400">
          {shortName(request.buyer.name)} · {timeAgo(request.createdAt)} açıldı
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isOwner ? (
          <p className="text-sm text-slate-600">
            Bu senin talebin.{" "}
            <Link href={`/panel/is-taleplerim/${request.id}`} className="font-semibold text-purple-700 hover:underline">
              Gelen Teklifleri Gör
            </Link>
          </p>
        ) : !open ? (
          <p className="text-sm text-slate-500">Bu talep artık teklif almıyor.</p>
        ) : !user ? (
          <p className="text-sm text-slate-600">
            Teklif vermek için{" "}
            <Link href={`/giris?callbackUrl=/is-talepleri/${request.id}`} className="font-semibold text-purple-700 hover:underline">
              giriş yap
            </Link>{" "}
            ya da{" "}
            <Link href="/kayit?role=FREELANCER" className="font-semibold text-purple-700 hover:underline">
              freelancer olarak kaydol
            </Link>
            .
          </p>
        ) : !isFreelancer ? (
          <p className="text-sm text-slate-600">
            Teklifleri freelancer&apos;lar verir.{" "}
            {user.role === "BUYER" && (
              <Link href="/panel/freelancer-ol" className="font-semibold text-purple-700 hover:underline">
                Freelancer Ol
              </Link>
            )}
          </p>
        ) : gigs.length === 0 ? (
          <p className="text-sm text-slate-600">
            Teklif vermek için yayında en az bir ilanın olmalı.{" "}
            <Link href="/panel/ilan-olustur" className="font-semibold text-purple-700 hover:underline">
              İlan Oluştur
            </Link>
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-brand-navy">{myOffer && myOffer.status !== "WITHDRAWN" ? "Teklifin" : "Teklif Ver"}</h2>
              {myOffer?.status === "PENDING" && (
                <form action={withdrawOfferAction.bind(null, request.id, myOffer.id)}>
                  <button className="text-xs font-semibold text-slate-400 hover:text-red-600">Teklifi Geri Çek</button>
                </form>
              )}
            </div>
            {myOffer && (myOffer.status === "ACCEPTED" || myOffer.status === "DECLINED") ? (
              <p className="text-sm text-slate-600">
                Teklifin {myOffer.status === "ACCEPTED" ? "kabul edildi." : "sonuçlandı."}
              </p>
            ) : (
              <OfferForm
                requestId={request.id}
                // Gigs in the request's category first: the likeliest match.
                gigs={[...gigs].sort((a, b) => Number(b.categoryId === request.categoryId) - Number(a.categoryId === request.categoryId))}
                existing={
                  myOffer && myOffer.status === "PENDING"
                    ? { gigId: myOffer.gigId, price: Number(myOffer.price), deliveryDays: myOffer.deliveryDays, message: myOffer.message }
                    : null
                }
                quotaNote={
                  usage
                    ? myOffer
                      ? "Teklifini güncellemek hak kullanmaz."
                      : `Bu ay ${usage.used}/${usage.quota} teklif hakkı kullandın.`
                    : ""
                }
              />
            )}
            {usage && usage.left === 0 && !myOffer && (
              <p className="mt-3 text-xs text-slate-500">
                <Link href="/panel/pro-ol" className="font-semibold text-purple-700 hover:underline">Pro üyelikle</Link> daha fazla teklif verebilirsin.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
