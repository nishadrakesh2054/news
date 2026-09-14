import type { CategorySeedDef } from "./types";
import { CANONICAL_CATEGORIES } from "../../constants/categories";

/** Seed-dev uses the same canonical 12 categories as production. */
export const CATEGORY_DEFS: CategorySeedDef[] = CANONICAL_CATEGORIES.map((c) => ({
  name: c.name,
  nameNp: c.nameNp,
  slug: c.slug,
  order: c.order,
  description: c.description,
  descriptionNp: c.descriptionNp,
}));
