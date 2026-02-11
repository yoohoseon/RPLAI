-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BrandAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "competitors" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BrandAnalysis" ("brand", "category", "competitors", "createdAt", "id", "target", "url", "userId") SELECT "brand", "category", "competitors", "createdAt", "id", "target", "url", "userId" FROM "BrandAnalysis";
DROP TABLE "BrandAnalysis";
ALTER TABLE "new_BrandAnalysis" RENAME TO "BrandAnalysis";
CREATE INDEX "BrandAnalysis_userId_idx" ON "BrandAnalysis"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
