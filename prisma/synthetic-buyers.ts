/**
 * Purely synthetic buyer accounts — showcase content, not real sign-ups, in the same
 * spirit as the generated freelancer pool. Unlike a freelancer they need nothing beyond
 * a name: buyers do not have a public profile page, so age/city/skills/bio would never
 * be shown anywhere.
 *
 * Deterministic from index like the rest of this file's siblings: re-running the
 * generator for the same count reproduces the same people instead of adding a second
 * batch.
 */

import { feminineNames, masculineNames } from "../src/lib/turkish-names";
import { surnames, hash32, reader } from "./synthetic-freelancers";

const SYNTHETIC_BUYER_EMAIL_PREFIX = "alici";
const SYNTHETIC_BUYER_EMAIL_DOMAIN = "demo.prosinta.com";

export type SyntheticBuyer = {
  email: string;
  name: string;
};

export function generateSyntheticBuyers(count: number): SyntheticBuyer[] {
  const people: SyntheticBuyer[] = [];
  const usedNames = new Set<string>();

  for (let index = 0; index < count; index++) {
    const email = `${SYNTHETIC_BUYER_EMAIL_PREFIX}${index + 1}@${SYNTHETIC_BUYER_EMAIL_DOMAIN}`;
    const r = reader(hash32(email));

    const feminine = r(2) === 0;
    const firstNamePool = feminine ? feminineNames : masculineNames;
    let firstNameIndex = r(firstNamePool.length);
    let surnameIndex = r(surnames.length);
    let name = `${firstNamePool[firstNameIndex]} ${surnames[surnameIndex]}`;

    for (let taken = 0; usedNames.has(name); taken++) {
      surnameIndex = (surnameIndex + 1) % surnames.length;
      if (taken > 0 && taken % surnames.length === 0) {
        firstNameIndex = (firstNameIndex + 1) % firstNamePool.length;
      }
      name = `${firstNamePool[firstNameIndex]} ${surnames[surnameIndex]}`;
    }
    usedNames.add(name);

    people.push({ email, name });
  }

  return people;
}
