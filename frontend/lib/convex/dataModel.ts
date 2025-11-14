// Temporary stub for Convex dataModel - will be replaced when you run `npx convex dev`
// This allows TypeScript to compile before Convex is fully initialized

export type Id<T extends string> = string & { __table?: T };
