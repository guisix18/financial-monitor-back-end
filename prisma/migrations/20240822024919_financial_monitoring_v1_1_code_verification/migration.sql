-- CreateTable
CREATE TABLE "CodeVerification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "already_used" BOOLEAN NOT NULL DEFAULT false,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "used_at" TIMESTAMP(6),
    "expire_date" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "CodeVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeVerification_user_id_key" ON "CodeVerification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CodeVerification_code_key" ON "CodeVerification"("code");

-- AddForeignKey
ALTER TABLE "CodeVerification" ADD CONSTRAINT "CodeVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
