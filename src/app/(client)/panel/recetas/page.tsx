import { requireClientArea } from "@/lib/auth/client-access";
import { prisma } from "@/lib/db/prisma";
import { RecipesClient } from "./recipes-client";
import type { RecipeCardData } from "@/components/recipe-card";

export const dynamic = "force-dynamic";

export default async function ClientRecipesPage() {
  const { session } = await requireClientArea("recipes");

  const assignments = await prisma.clientRecipe.findMany({
    where: { clientId: session.sub },
    include: { recipe: true },
    orderBy: { assignedAt: "desc" },
  });

  const recipes: RecipeCardData[] = assignments.map((a) => ({
    id: a.recipe.id,
    title: a.recipe.title,
    description: a.recipe.description,
    category: a.recipe.category,
    servings: a.recipe.servings,
    prepTimeMin: a.recipe.prepTimeMin,
    cookTimeMin: a.recipe.cookTimeMin,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allergens: (a.recipe.allergens as any) ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ingredients: (a.recipe.ingredients as any) ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    steps: (a.recipe.steps as any) ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    macros: (a.recipe.macros as any) ?? {},
    aiGenerated: a.recipe.aiGenerated,
  }));

  return <RecipesClient recipes={recipes} />;
}
