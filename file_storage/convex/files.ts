
import { v } from "convex/values"
import {mutation, query} from "./_generated/server"

// This is a mutation that creates a file in the databasem, is a table called "files"
export const createFile = mutation({
    args: {
        name: v.string(),
    },
    async handler(ctx, args) {

        // This is how you get the identity of the user that is logged con clerk, usa el archivo de auth.config.ts
        const identity = await ctx.auth.getUserIdentity()
        
        if (!identity) {
            throw new Error("You must be logged in to upload a file")
        }

        await ctx.db.insert("files", {
            name: args.name,
        })
    }
})

// This is a query that gets all the files from the database
export const getFiles = query({
    args: {},
    async handler(ctx, args) {

        const identity = await ctx.auth.getUserIdentity()
        
        if (!identity) {
            return []
        }

        return await ctx.db.query("files").collect()
    }
})