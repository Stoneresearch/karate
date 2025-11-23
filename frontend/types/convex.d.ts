// Type declarations for Convex API
// This file allows TypeScript to compile before Convex is fully initialized
// Will be replaced when you run `npx convex dev`

declare module '../../../convex/_generated/api' {
  export const api: any;
  export const internal: any;
  export const components: any;
}

declare module '../../../../convex/_generated/api' {
  export const api: any;
  export const internal: any;
  export const components: any;
}

declare module '../../../convex/_generated/dataModel' {
  export type Id<T extends string> = string & { __table?: T };
}

declare module '../../../../convex/_generated/dataModel' {
  export type Id<T extends string> = string & { __table?: T };
}















