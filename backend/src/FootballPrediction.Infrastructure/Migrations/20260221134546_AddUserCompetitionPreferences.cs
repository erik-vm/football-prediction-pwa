using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballPrediction.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCompetitionPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserCompetitionPreferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetitionCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompetitionPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCompetitionPreferences_Competitions_CompetitionCode",
                        column: x => x.CompetitionCode,
                        principalTable: "Competitions",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserCompetitionPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetitionPreferences_CompetitionCode",
                table: "UserCompetitionPreferences",
                column: "CompetitionCode");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetitionPreferences_UserId_CompetitionCode",
                table: "UserCompetitionPreferences",
                columns: new[] { "UserId", "CompetitionCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCompetitionPreferences");
        }
    }
}
