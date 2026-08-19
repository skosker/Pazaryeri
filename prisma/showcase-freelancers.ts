import { generateBulkData } from "./bulk-gigs-data";
import { describeShowcaseFreelancer, type ShowcaseProfile } from "./synthetic-freelancers";

/**
 * The demo sellers that existed before the generator: the eight named accounts the seed
 * writes by hand, and fl1..fl200 from the bulk catalogue. They own all the listings and
 * reviews in the demo content, so their names and titles stay as they are — only the
 * profile details the generator produces (age, city, expertise, photo, bio) are filled in.
 */

/** Named demo sellers. The gig list in `seed.ts` refers to these by e-mail. */
export const DEMO_SELLERS = [
  { name: "Elif K.", email: "elif@profestia.dev", title: "Sosyal Medya Uzmanı" },
  { name: "Mert A.", email: "mert@profestia.dev", title: "Full Stack Geliştirici" },
  { name: "Aslı T.", email: "asli@profestia.dev", title: "SEO İçerik Yazarı" },
  { name: "Can Y.", email: "can@profestia.dev", title: "Logo & Marka Tasarımcısı" },
  { name: "Zeynep B.", email: "zeynep@profestia.dev", title: "Video Editörü" },
  { name: "Burak S.", email: "burak@profestia.dev", title: "Reklam Yöneticisi" },
  { name: "Deniz A.", email: "deniz@profestia.dev", title: "AI & Otomasyon Danışmanı" },
  { name: "Ayşe Ö.", email: "ayse@profestia.dev", title: "Veri Analisti" },
];

/** Every pre-existing demo seller, with the profile details filled in. */
export function showcaseFreelancers(): ShowcaseProfile[] {
  const bulk = generateBulkData().sellers;
  return [...DEMO_SELLERS, ...bulk].map(describeShowcaseFreelancer);
}
