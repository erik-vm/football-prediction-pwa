CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "Tournaments" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Code" character varying(10) NOT NULL,
    "Season" character varying(20) NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "Country" text,
    "Type" text,
    "LogoUrl" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Tournaments" PRIMARY KEY ("Id")
);

CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Username" character varying(50) NOT NULL,
    "Email" character varying(255) NOT NULL,
    "PasswordHash" text NOT NULL,
    "RefreshToken" text,
    "RefreshTokenExpiry" timestamp with time zone,
    "IsAdmin" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE "GameWeeks" (
    "Id" uuid NOT NULL,
    "TournamentId" uuid NOT NULL,
    "WeekNumber" integer NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "IsCurrent" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_GameWeeks" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_GameWeeks_Tournaments_TournamentId" FOREIGN KEY ("TournamentId") REFERENCES "Tournaments" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Matches" (
    "Id" uuid NOT NULL,
    "TournamentId" uuid NOT NULL,
    "GameWeekId" uuid,
    "HomeTeam" character varying(100) NOT NULL,
    "AwayTeam" character varying(100) NOT NULL,
    "KickoffTime" timestamp with time zone NOT NULL,
    "HomeScore" integer,
    "AwayScore" integer,
    "Status" character varying(20) NOT NULL,
    "CompetitionCode" character varying(10) NOT NULL,
    "Season" text NOT NULL,
    "Matchday" integer,
    "IsFinished" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Matches" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Matches_GameWeeks_GameWeekId" FOREIGN KEY ("GameWeekId") REFERENCES "GameWeeks" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Matches_Tournaments_TournamentId" FOREIGN KEY ("TournamentId") REFERENCES "Tournaments" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Predictions" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "MatchId" uuid NOT NULL,
    "HomeScore" integer NOT NULL,
    "AwayScore" integer NOT NULL,
    "PointsEarned" integer,
    "Status" character varying(20) NOT NULL,
    "CompetitionCode" character varying(10) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Predictions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Predictions_Matches_MatchId" FOREIGN KEY ("MatchId") REFERENCES "Matches" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Predictions_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_GameWeeks_TournamentId_WeekNumber" ON "GameWeeks" ("TournamentId", "WeekNumber");

CREATE INDEX "IX_Matches_GameWeekId" ON "Matches" ("GameWeekId");

CREATE INDEX "IX_Matches_KickoffTime" ON "Matches" ("KickoffTime");

CREATE INDEX "IX_Matches_Status" ON "Matches" ("Status");

CREATE INDEX "IX_Matches_TournamentId_GameWeekId" ON "Matches" ("TournamentId", "GameWeekId");

CREATE INDEX "IX_Predictions_MatchId" ON "Predictions" ("MatchId");

CREATE INDEX "IX_Predictions_Status" ON "Predictions" ("Status");

CREATE UNIQUE INDEX "IX_Predictions_UserId_MatchId" ON "Predictions" ("UserId", "MatchId");

CREATE UNIQUE INDEX "IX_Tournaments_Code_Season" ON "Tournaments" ("Code", "Season");

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

CREATE UNIQUE INDEX "IX_Users_Username" ON "Users" ("Username");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260323114023_InitialCreate', '9.0.0');

COMMIT;

