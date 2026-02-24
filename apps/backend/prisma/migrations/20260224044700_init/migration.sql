-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL,
    "company_name" TEXT,
    "logo_url" TEXT,
    "address" TEXT,
    "email" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slides" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text_content" TEXT,
    "media_url" TEXT,
    "media_type" "MediaType",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "slides_project_id_order_idx" ON "slides"("project_id", "order");

-- AddForeignKey
ALTER TABLE "slides" ADD CONSTRAINT "slides_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
