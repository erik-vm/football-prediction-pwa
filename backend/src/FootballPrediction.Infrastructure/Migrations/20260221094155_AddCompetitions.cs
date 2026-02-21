using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballPrediction.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetitions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompetitionCode",
                table: "Matches",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Matchday",
                table: "Matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Venue",
                table: "Matches",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Competitions",
                columns: table => new
                {
                    Code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Emblem = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competitions", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyBonuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    GameWeekId = table.Column<Guid>(type: "uuid", nullable: false),
                    BonusPoints = table.Column<int>(type: "integer", nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyBonuses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WeeklyBonuses_GameWeeks_GameWeekId",
                        column: x => x.GameWeekId,
                        principalTable: "GameWeeks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WeeklyBonuses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Matches_CompetitionCode",
                table: "Matches",
                column: "CompetitionCode");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_Matchday",
                table: "Matches",
                column: "Matchday");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_IsActive",
                table: "Competitions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyBonuses_GameWeekId",
                table: "WeeklyBonuses",
                column: "GameWeekId");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyBonuses_UserId_GameWeekId",
                table: "WeeklyBonuses",
                columns: new[] { "UserId", "GameWeekId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Competitions_CompetitionCode",
                table: "Matches",
                column: "CompetitionCode",
                principalTable: "Competitions",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Competitions_CompetitionCode",
                table: "Matches");

            migrationBuilder.DropTable(
                name: "Competitions");

            migrationBuilder.DropTable(
                name: "WeeklyBonuses");

            migrationBuilder.DropIndex(
                name: "IX_Matches_CompetitionCode",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_Matchday",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "CompetitionCode",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Matchday",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Venue",
                table: "Matches");
        }
    }
}
