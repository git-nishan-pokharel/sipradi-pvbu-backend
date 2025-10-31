/*
  Warnings:

  - The primary key for the `AccessPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AccessPolicy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `AccessRules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AccessRules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `actionConditionId` column on the `AccessRules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ActionCondition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ActionCondition` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Resource` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Resource` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ResourceAction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ResourceAction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `resourceActionId` on the `AccessRules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `policyId` on the `AccessRules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `resourceActionId` on the `ActionCondition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `resourceId` on the `ResourceAction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."AccessRules" DROP CONSTRAINT "AccessRules_actionConditionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AccessRules" DROP CONSTRAINT "AccessRules_policyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AccessRules" DROP CONSTRAINT "AccessRules_resourceActionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ActionCondition" DROP CONSTRAINT "ActionCondition_resourceActionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResourceAction" DROP CONSTRAINT "ResourceAction_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_accessId_fkey";

-- AlterTable
ALTER TABLE "AccessPolicy" DROP CONSTRAINT "AccessPolicy_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AccessPolicy_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "AccessRules" DROP CONSTRAINT "AccessRules_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "resourceActionId",
ADD COLUMN     "resourceActionId" INTEGER NOT NULL,
DROP COLUMN "policyId",
ADD COLUMN     "policyId" INTEGER NOT NULL,
DROP COLUMN "actionConditionId",
ADD COLUMN     "actionConditionId" INTEGER,
ADD CONSTRAINT "AccessRules_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ActionCondition" DROP CONSTRAINT "ActionCondition_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "resourceActionId",
ADD COLUMN     "resourceActionId" INTEGER NOT NULL,
ADD CONSTRAINT "ActionCondition_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Resource_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ResourceAction" DROP CONSTRAINT "ResourceAction_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "resourceId",
ADD COLUMN     "resourceId" INTEGER NOT NULL,
ADD CONSTRAINT "ResourceAction_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessId",
ADD COLUMN     "accessId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ResourceAction_name_resourceId_key" ON "ResourceAction"("name", "resourceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "AccessPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRules" ADD CONSTRAINT "AccessRules_resourceActionId_fkey" FOREIGN KEY ("resourceActionId") REFERENCES "ResourceAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRules" ADD CONSTRAINT "AccessRules_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AccessPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRules" ADD CONSTRAINT "AccessRules_actionConditionId_fkey" FOREIGN KEY ("actionConditionId") REFERENCES "ActionCondition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceAction" ADD CONSTRAINT "ResourceAction_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionCondition" ADD CONSTRAINT "ActionCondition_resourceActionId_fkey" FOREIGN KEY ("resourceActionId") REFERENCES "ResourceAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
