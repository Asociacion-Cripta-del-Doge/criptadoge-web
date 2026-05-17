-- CreateTable
CREATE TABLE "Mesa" (
    "id" TEXT NOT NULL,
    "asientos" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "esDePago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_orden_key" ON "Mesa"("orden");
