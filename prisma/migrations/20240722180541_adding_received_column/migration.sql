-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "received_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
