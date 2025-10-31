-- CreateEnum
CREATE TYPE "AccessRuleEffect" AS ENUM ('allow', 'deny');

-- CreateEnum
CREATE TYPE "EGender" AS ENUM ('male', 'female', 'others');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('activated', 'pending', 'disabled');

-- CreateEnum
CREATE TYPE "VehicleVideoType" AS ENUM ('vehicleOrientation', 'chargingOrientation');

-- CreateEnum
CREATE TYPE "VehicleDocumentationType" AS ENUM ('warrantyFile', 'serviceManual');

-- CreateEnum
CREATE TYPE "VehicleGuidelineType" AS ENUM ('dos', 'donts');

-- CreateEnum
CREATE TYPE "ProfilingQuestionType" AS ENUM ('MCQ', 'MA', 'FitB', 'OpenEnded');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('featureRequest', 'maintenance', 'repair');

-- CreateEnum
CREATE TYPE "TermsAndPolicyType" AS ENUM ('termsAndAgreement', 'privacyPolicy');

-- CreateEnum
CREATE TYPE "CustomerVehicleDocumentType" AS ENUM ('taxInvoice', 'warranty', 'extendedWarranty', 'amc', 'blueBook', 'licence');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "registeredName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "gender" "EGender" NOT NULL,
    "rfid" TEXT NOT NULL,
    "registeredPhoneNumber" TEXT NOT NULL,
    "contactPhoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'pending',
    "passwordResetOtp" TEXT,
    "passwordResetOtpExpirationTime" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetTokenExpirationTime" TIMESTAMP(3),
    "accessId" UUID,
    "designationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModels" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "batteryRange" TEXT NOT NULL,
    "chargingTime" TEXT NOT NULL,
    "erpVehicleModelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleVideos" (
    "id" UUID NOT NULL,
    "videoType" "VehicleVideoType" NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "vehicleModelId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleVideos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDocuments" (
    "id" UUID NOT NULL,
    "documentationType" "VehicleVideoType" NOT NULL,
    "documentationUrl" TEXT NOT NULL,
    "description" TEXT,
    "vehicleModelId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleGuidelines" (
    "id" UUID NOT NULL,
    "guidelineType" "VehicleGuidelineType" NOT NULL,
    "content" TEXT NOT NULL,
    "vehicleModelId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleGuidelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfileQuestion" (
    "id" UUID NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "ProfilingQuestionType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "questionOrderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfileQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfileQuestionOptions" (
    "id" UUID NOT NULL,
    "optionText" TEXT NOT NULL,
    "optionOrderIndex" INTEGER NOT NULL,
    "questionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfileQuestionOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfileAnswers" (
    "id" UUID NOT NULL,
    "answerText" TEXT NOT NULL,
    "questionId" UUID NOT NULL,
    "optionId" UUID,
    "userId" UUID NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerProfileAnswers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedVehicles" (
    "id" UUID NOT NULL,
    "chasisNumber" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "vehicleColor" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "vehicleModelId" UUID NOT NULL,

    CONSTRAINT "AssignedVehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVehicleDocuments" (
    "id" UUID NOT NULL,
    "documentType" "CustomerVehicleDocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "Remarks" TEXT,
    "assignedVehicleId" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerVehicleDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "referredBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "providedBy" UUID NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsAndPolicy" (
    "id" UUID NOT NULL,
    "type" "TermsAndPolicyType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsAndPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQs" (
    "id" UUID NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQTags" (
    "id" UUID NOT NULL,
    "faqId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "FAQTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "imageUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" JSONB NOT NULL,
    "sharedBy" JSONB NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPolicy" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRules" (
    "id" UUID NOT NULL,
    "resource" TEXT NOT NULL,
    "effect" "AccessRuleEffect" NOT NULL DEFAULT 'allow',
    "resourceActionId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "actionConditionId" UUID,
    "ruleIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceAction" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "resourceId" UUID NOT NULL,

    CONSTRAINT "ResourceAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionCondition" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "resourceActionId" UUID NOT NULL,

    CONSTRAINT "ActionCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rfid_key" ON "User"("rfid");

-- CreateIndex
CREATE UNIQUE INDEX "User_registeredPhoneNumber_key" ON "User"("registeredPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_contactPhoneNumber_key" ON "User"("contactPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_name_key" ON "Designation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedVehicles_chasisNumber_key" ON "AssignedVehicles"("chasisNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedVehicles_registrationNumber_key" ON "AssignedVehicles"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_email_key" ON "Referral"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_contactNumber_key" ON "Referral"("contactNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPolicy_title_key" ON "AccessPolicy"("title");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRules_ruleIdentifier_key" ON "AccessRules"("ruleIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceAction_name_resourceId_key" ON "ResourceAction"("name", "resourceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "AccessPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleVideos" ADD CONSTRAINT "VehicleVideos_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDocuments" ADD CONSTRAINT "VehicleDocuments_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGuidelines" ADD CONSTRAINT "VehicleGuidelines_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfileQuestionOptions" ADD CONSTRAINT "CustomerProfileQuestionOptions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CustomerProfileQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfileAnswers" ADD CONSTRAINT "CustomerProfileAnswers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CustomerProfileQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfileAnswers" ADD CONSTRAINT "CustomerProfileAnswers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "CustomerProfileQuestionOptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfileAnswers" ADD CONSTRAINT "CustomerProfileAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedVehicles" ADD CONSTRAINT "AssignedVehicles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedVehicles" ADD CONSTRAINT "AssignedVehicles_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVehicleDocuments" ADD CONSTRAINT "CustomerVehicleDocuments_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "AssignedVehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_providedBy_fkey" FOREIGN KEY ("providedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermsAndPolicy" ADD CONSTRAINT "TermsAndPolicy_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermsAndPolicy" ADD CONSTRAINT "TermsAndPolicy_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQTags" ADD CONSTRAINT "FAQTags_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQTags" ADD CONSTRAINT "FAQTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
