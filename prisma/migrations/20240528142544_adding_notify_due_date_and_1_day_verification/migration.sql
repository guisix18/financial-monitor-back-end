/*
  Warnings:

  - You are about to drop the column `already_notify` on the `Bill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "already_notify",
ADD COLUMN     "already_notify_1_day" BOOLEAN DEFAULT false,
ADD COLUMN     "already_notify_due_date" BOOLEAN DEFAULT false;
