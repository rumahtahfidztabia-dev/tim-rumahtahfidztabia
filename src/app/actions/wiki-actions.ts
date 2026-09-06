"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Team } from "@/generated/prisma/client";

// Get tree of wiki pages
export async function getWikiTree(team?: Team) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const whereClause = team ? { OR: [{ team }, { team: null }] } : {};

  // Fetch all pages (without full content for lighter payload)
  const pages = await prisma.wikiPage.findMany({
    where: whereClause,
    select: {
      id: true,
      slug: true,
      title: true,
      parentId: true,
      team: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { title: "asc" },
  });

  return pages;
}

// Get specific wiki page
export async function getWikiPage(slug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const page = await prisma.wikiPage.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      parent: { select: { title: true, slug: true } },
    }
  });

  return page;
}

// Generate unique slug
async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!slug) slug = "page";

  let exists = await prisma.wikiPage.findUnique({ where: { slug } });
  if (!exists) return slug;

  let counter = 1;
  while (exists) {
    const newSlug = `${slug}-${counter}`;
    exists = await prisma.wikiPage.findUnique({ where: { slug: newSlug } });
    if (!exists) return newSlug;
    counter++;
  }
  return slug;
}

// Create new wiki page
export async function createWikiPage(data: {
  title: string;
  content: string;
  parentId?: string | null;
  team?: Team | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const user = session.user as { id: string; role: string };
  if (user.role !== "SUPERADMIN") throw new Error("Only superadmin can create wiki pages");

  const userId = user.id;
  const slug = await generateUniqueSlug(data.title);

  const page = await prisma.wikiPage.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      parentId: data.parentId || null,
      team: data.team || null,
      authorId: userId,
    }
  });

  revalidatePath("/wiki");
  return page;
}

// Update wiki page
export async function updateWikiPage(id: string, data: {
  title: string;
  content: string;
  parentId?: string | null;
  team?: Team | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const user = session.user as { role: string };
  if (user.role !== "SUPERADMIN") throw new Error("Only superadmin can edit wiki pages");

  const existing = await prisma.wikiPage.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  let slug = existing.slug;
  if (existing.title !== data.title) {
    slug = await generateUniqueSlug(data.title);
  }

  // Prevent circular parent references (simple check: cannot set parent to self)
  if (data.parentId === id) {
    throw new Error("Cannot set parent to self");
  }

  const page = await prisma.wikiPage.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      content: data.content,
      parentId: data.parentId || null,
      team: data.team || null,
    }
  });

  revalidatePath("/wiki");
  revalidatePath(`/wiki/${existing.slug}`);
  return page;
}

// Delete wiki page
export async function deleteWikiPage(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const user = session.user as { id: string, role: string };
  if (user.role !== "SUPERADMIN") {
     throw new Error("Only superadmin can delete wiki pages");
  }

  // Check for children
  const childrenCount = await prisma.wikiPage.count({ where: { parentId: id } });
  if (childrenCount > 0) {
    throw new Error("Cannot delete page with subpages. Delete or move subpages first.");
  }

  await prisma.wikiPage.delete({ where: { id } });
  revalidatePath("/wiki");
}
