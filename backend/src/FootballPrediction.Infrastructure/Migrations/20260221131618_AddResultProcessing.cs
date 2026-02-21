using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballPrediction.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResultProcessing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompetitionCode",
                table: "Predictions",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Predictions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "PENDING");

            migrationBuilder.CreateTable(
                name: "UserCompetitionStats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompetitionCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    TotalPredictions = table.Column<int>(type: "integer", nullable: false),
                    Accuracy = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Rank = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompetitionStats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCompetitionStats_Competitions_CompetitionCode",
                        column: x => x.CompetitionCode,
                        principalTable: "Competitions",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserCompetitionStats_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_CompetitionCode",
                table: "Predictions",
                column: "CompetitionCode");

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_Status",
                table: "Predictions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetitionStats_CompetitionCode",
                table: "UserCompetitionStats",
                column: "CompetitionCode");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetitionStats_TotalPoints",
                table: "UserCompetitionStats",
                column: "TotalPoints");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetitionStats_UserId",
                table: "UserCompetitionStats",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompetitionStats_UserId_CompetitionCode",
                table: "UserCompetitionStats",
                columns: new[] { "UserId", "CompetitionCode" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Predictions_Competitions_CompetitionCode",
                table: "Predictions",
                column: "CompetitionCode",
                principalTable: "Competitions",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Predictions_Competitions_CompetitionCode",
                table: "Predictions");

            migrationBuilder.DropTable(
                name: "UserCompetitionStats");

            migrationBuilder.DropIndex(
                name: "IX_Predictions_CompetitionCode",
                table: "Predictions");

            migrationBuilder.DropIndex(
                name: "IX_Predictions_Status",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "CompetitionCode",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Predictions");
        }
    }
}
