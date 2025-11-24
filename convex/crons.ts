import { cronJobs } from "convex/server";
// import { internal } from "./_generated/api";

const crons = cronJobs();

// Disabled for now to allow permanent storage
// crons.interval(
//   "clear old files",
//   { minutes: 60 },
//   internal.files.clearOldFiles,
//   {}
// );

export default crons;
