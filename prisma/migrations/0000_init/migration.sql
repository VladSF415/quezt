-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "divisions" TEXT[],
    "prizes" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "players" JSONB NOT NULL,
    "division" TEXT NOT NULL,
    "cellPhone" TEXT,
    "email" TEXT NOT NULL,
    "volunteerReferee" BOOLEAN NOT NULL DEFAULT false,
    "volunteerScoreboard" BOOLEAN NOT NULL DEFAULT false,
    "liabilityAgreed" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

