-- AlterTable
ALTER TABLE "microservice_tool" ALTER COLUMN "inputSchema" DROP DEFAULT;

-- CreateTable
CREATE TABLE "catia_conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "catia_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catia_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catia_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catia_conversation_userId_updatedAt_idx" ON "catia_conversation"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "catia_message_conversationId_createdAt_idx" ON "catia_message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "catia_conversation" ADD CONSTRAINT "catia_conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catia_message" ADD CONSTRAINT "catia_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "catia_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
