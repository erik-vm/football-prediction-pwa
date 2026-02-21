using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballPrediction.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchFilteringIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Matches_CompetitionCode_IsFinished_Matchday",
                table: "Matches",
                columns: new[] { "CompetitionCode", "IsFinished", "Matchday" });

            migrationBuilder.CreateIndex(
                name: "IX_Matches_CompetitionCode_KickoffTime",
                table: "Matches",
                columns: new[] { "CompetitionCode", "KickoffTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Matches_CompetitionCode_IsFinished_Matchday",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_CompetitionCode_KickoffTime",
                table: "Matches");
        }
    }
}
