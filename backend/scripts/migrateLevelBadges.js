// DEPRECATED — kept only for backward compatibility.
// Use the new unified migration instead:
//    cd backend && node scripts/migrateGamification.js
//
// This shim delegates to migrateGamification.js so the old steep
// XP formula (100*i per level) is NO LONGER used anywhere.
require("./migrateGamification");
