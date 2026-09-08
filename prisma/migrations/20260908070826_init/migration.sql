-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "title" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "regionCode" TEXT,
    "postalCode" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "timezone" TEXT,
    "continent" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "browserVer" TEXT,
    "os" TEXT,
    "osVer" TEXT,
    "deviceType" TEXT,
    "deviceModel" TEXT,
    "referer" TEXT,
    "language" TEXT,
    "jsAt" TIMESTAMP(3),
    "screenW" INTEGER,
    "screenH" INTEGER,
    "viewportW" INTEGER,
    "viewportH" INTEGER,
    "dpr" DOUBLE PRECISION,
    "colorDepth" INTEGER,
    "jsTimezone" TEXT,
    "jsLanguages" TEXT,
    "platform" TEXT,
    "touch" BOOLEAN,
    "cores" INTEGER,
    "memoryGb" DOUBLE PRECISION,
    "connection" TEXT,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Click_linkId_createdAt_idx" ON "Click"("linkId", "createdAt");

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
