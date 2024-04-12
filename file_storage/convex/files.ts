import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";
import { access } from "fs";

// This function generates a URL to upload a file to the storage
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }

  return await ctx.storage.generateUploadUrl();
});

// This function checks if the user has access to the organization
async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {

  const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

  // Obtenemos el usuario actual
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

    if (!user) {
      return null;
    }


  const hasAccess =
    user.orgIds.some(item => item.orgId === orgId) || user.tokenIdentifier.includes(orgId);

    if (!hasAccess) {
      return null;
    }

  return {user };
}

// This is a mutation that creates a file in the databasem, is a table called "files"
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    /* 
    error de prueba:
    throw new ConvexError("You must be logged in to upload a file"); */


    const hasAccess = await hasAccessToOrg(
      ctx,
      args.orgId
    );

    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
    });
  },
});

// This is a query that gets all the files from the database
export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
  },
  async handler(ctx, args) {

    const hasAccess = await hasAccessToOrg(
      ctx,
      args.orgId
    );

    if (!hasAccess) {
      return [];
    }

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const query = args.query;

    if (query) {
      // Filtra los archivos que contienen el query, realiza una busqueda
      files = files.filter((file) => file.name.toLowerCase().includes(query.toLocaleLowerCase()));
    }

    if (args.favorites) {

      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );


    }

    return files;

    /* const filesWithUrl = await Promise.all(
        files.map(async (file) => ({
          ...file,
          url: await ctx.storage.getUrl(file.fileId),
        }))
      );
  
      return filesWithUrl; */
  },
});

// This is a mutation that deletes a file from the database
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("You do not have access to this file");
    }

    // Verificamos si el usuario es admin, aunque en frond no se vea por la proteccion de clerk esta es una forma de asegurarnos que no habran vulnerabilidades
    const isAdmin = access.user.orgIds.find(org => org.orgId === access.file.orgId)?.role === "admin";

    if (!isAdmin) {
      throw new ConvexError("You do not have access to delete this file");
    }

    await ctx.db.delete(args.fileId);
  },
});

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("You do not have access to this file");
    }

    // Buscamos si el archivo ya esta en favoritos
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id)
      )
      .first();

    // Si no esta en favoritos, lo agregamos, si esta, lo eliminamos
    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: access.file._id,
        orgId: access.file.orgId,
        userId: access.user._id,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

// Obtiene todos los favoritos
export const getAllFavorites = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {

    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    // Buscamos si el archivo ya esta en favoritos
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", hasAccess.user._id)
          .eq("orgId", args.orgId)
      )
      .collect();

      return favorites;
  },
});

// This function checks if the user has access to the file
async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {

  const file = await ctx.db.get(fileId);

  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(
    ctx,
    file.orgId
  );

  if (!hasAccess) {
    return null;
  }

  return { file, user: hasAccess.user };
}
