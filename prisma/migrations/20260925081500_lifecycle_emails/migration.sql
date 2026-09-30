ALTER TABLE "User" ADD COLUMN "signupSource" TEXT,
ADD COLUMN "marketingOptOut" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "LifecycleEmail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LifecycleEmail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LifecycleEmail_userId_kind_key" ON "LifecycleEmail"("userId", "kind");

ALTER TABLE "LifecycleEmail" ADD CONSTRAINT "LifecycleEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
