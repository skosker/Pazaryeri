/**
 * Turkish first names, split by the gender they read as.
 *
 * Two things use this. The profile generator draws names from the pools, and the profile
 * photo — drawn or fetched — follows the name it was given: a freelancer called Elif
 * should not come back with a beard or a stock photo of a man. The lists are the only
 * place gender is decided, and it is only ever used for the picture.
 *
 * The pools are frozen: the order decides which generated profile gets which name, and
 * those names are already written into a migration. A name that turns up in older data
 * but is missing here goes in the `extra` lists below instead, where adding one shifts
 * nothing.
 */

export const feminineNames = [
  "Elif", "Zeynep", "Ayşe", "Fatma", "Merve", "Selin", "Ece", "Buse", "Ceren", "Gizem",
  "Naz", "Pelin", "İrem", "Sude", "Melis", "Hazal", "Sena", "Cansu", "Yasemin", "Derya",
  "Nil", "Beril", "Sibel", "Aylin", "Nihan", "Simge", "Ceyda", "Damla", "Selen", "Aslıhan",
  "Duygu", "Ebru", "Elvan", "Yağmur", "Zehra", "Esin", "Nurcan", "Gamze", "Sinem", "Aybüke",
  "Songül", "Perihan", "Şeyma", "Özge", "Nazlı", "Selma", "Beste", "Filiz", "Gülce", "Nesrin",
  "Belgin", "Ayten", "Feride", "Türkan", "Cansel", "Burcu", "Meltem", "Gonca", "Sevgi", "Dilara",
  "Melike", "Eda", "Tuğçe", "Berrak", "Hande", "Şevval", "İpek", "Bengi", "Ayça", "Şule",
  "Neslihan", "Rüya", "Ilgın", "Deren", "Aycan", "Betül", "Esra", "Öykü", "Defne", "Zeliha",
  "Bahar", "Çiğdem", "Seda", "Tuba", "Yeliz", "Nuray", "Sevil", "Ceyhan", "Ela", "Lale",
];

export const masculineNames = [
  "Ahmet", "Mehmet", "Emre", "Kerem", "Onur", "Kaan", "Yusuf", "Barış", "Tolga", "Serkan",
  "Emir", "Volkan", "Berk", "Arda", "Cem", "Umut", "Efe", "Alp", "Oğuz", "Kemal",
  "Tarık", "Gökhan", "Baran", "İlker", "Doruk", "Batu", "Uğur", "Eren", "Koray", "Fırat",
  "Kağan", "Bora", "Sarp", "Kutay", "Metin", "Kıvanç", "Bertan", "Tayfun", "Erhan", "Buğra",
  "Cenk", "Halil", "Mesut", "Taner", "Bahadır", "Reha", "Yiğit", "Orkun", "Timur", "Necati",
  "Rıza", "Kaya", "Semih", "Doğukan", "Salih", "Yavuz", "Onat", "İbrahim", "Aras", "Mert",
  "Can", "Deniz", "Burak", "Ozan", "Sinan", "Hakan", "Levent", "Murat", "Okan", "Tuna",
  "Cihan", "Ege", "Mustafa", "Ali", "Hasan", "Enes", "Furkan", "Berat", "Çağrı", "Selim",
  "Görkem", "Anıl", "Ufuk", "Sercan", "Erdem", "Tunahan", "Kadir", "Serdar", "Ünal", "Bülent",
];

/** Names from the older demo data that are not in the pools above. */
const extraFeminineNames = ["Aslı"];
const extraMasculineNames = ["Aytekin"];

const feminineLookup = new Set([...feminineNames, ...extraFeminineNames]);
const masculineLookup = new Set([...masculineNames, ...extraMasculineNames]);

/** True feminine, false masculine, null when the name is in neither list. */
export function looksFeminine(firstName: string): boolean | null {
  if (feminineLookup.has(firstName)) return true;
  if (masculineLookup.has(firstName)) return false;
  return null;
}
