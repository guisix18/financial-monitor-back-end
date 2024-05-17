-- AlterTable
ALTER TABLE "TransactionHistory" ADD COLUMN     "deleted_at" TIMESTAMP(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(6);
