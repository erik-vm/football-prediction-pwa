START TRANSACTION;
ALTER TABLE "Users" ADD "RefreshToken" text;

ALTER TABLE "Users" ADD "RefreshTokenExpiry" timestamp with time zone;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260207204113_AddRefreshTokenToUser', '9.0.0');

COMMIT;

