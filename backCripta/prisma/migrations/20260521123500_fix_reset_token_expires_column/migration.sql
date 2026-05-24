DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'restTokenExpires'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'resetTokenExpires'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "restTokenExpires" TO "resetTokenExpires";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'resetTokenExpires'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "resetTokenExpires" TIMESTAMP(3);
  END IF;
END $$;
