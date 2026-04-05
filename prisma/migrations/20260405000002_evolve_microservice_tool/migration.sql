-- Evolve MicroserviceTool: add inputSchema, outputSchema, method, requiredRole
-- Make description and endpoint NOT NULL, add unique constraint

-- Add new columns with defaults first
ALTER TABLE "microservice_tool" ADD COLUMN "inputSchema" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "microservice_tool" ADD COLUMN "outputSchema" JSONB;
ALTER TABLE "microservice_tool" ADD COLUMN "method" TEXT NOT NULL DEFAULT 'POST';
ALTER TABLE "microservice_tool" ADD COLUMN "requiredRole" TEXT;

-- Make description NOT NULL (set existing nulls to empty string first)
UPDATE "microservice_tool" SET "description" = '' WHERE "description" IS NULL;
ALTER TABLE "microservice_tool" ALTER COLUMN "description" SET NOT NULL;

-- Make endpoint NOT NULL (set existing nulls to empty string first)
UPDATE "microservice_tool" SET "endpoint" = '' WHERE "endpoint" IS NULL;
ALTER TABLE "microservice_tool" ALTER COLUMN "endpoint" SET NOT NULL;

-- Add unique constraint
CREATE UNIQUE INDEX "microservice_tool_applicationId_name_key" ON "microservice_tool"("applicationId", "name");
