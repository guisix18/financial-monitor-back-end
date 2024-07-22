-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "send_to_id" INTEGER,
ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_send_to_id_fkey" FOREIGN KEY ("send_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
