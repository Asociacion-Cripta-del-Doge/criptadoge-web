-- CreateEnum
CREATE TYPE "EstadoReservaMesa" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateTable
CREATE TABLE "ReservaMesa" (
    "id" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3) NOT NULL,
    "asientosReservados" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" "EstadoReservaMesa" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservaMesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservaMesa_mesaId_fechaHoraInicio_fechaHoraFin_idx" ON "ReservaMesa"("mesaId", "fechaHoraInicio", "fechaHoraFin");

-- CreateIndex
CREATE INDEX "ReservaMesa_userId_fechaHoraInicio_idx" ON "ReservaMesa"("userId", "fechaHoraInicio");

-- CreateIndex
CREATE INDEX "ReservaMesa_estado_idx" ON "ReservaMesa"("estado");

-- AddForeignKey
ALTER TABLE "ReservaMesa" ADD CONSTRAINT "ReservaMesa_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaMesa" ADD CONSTRAINT "ReservaMesa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "ReservaMesa" ADD CONSTRAINT "ReservaMesa_fechaHora_check" CHECK ("fechaHoraFin" > "fechaHoraInicio");

-- AddCheckConstraint
ALTER TABLE "ReservaMesa" ADD CONSTRAINT "ReservaMesa_asientosReservados_check" CHECK ("asientosReservados" > 0);

-- AddCheckConstraint
ALTER TABLE "ReservaMesa" ADD CONSTRAINT "ReservaMesa_precio_check" CHECK ("precio" >= 0);
