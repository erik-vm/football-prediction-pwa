using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FootballPrediction.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMatchForIdempotency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "GameWeekId",
                table: "Matches",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<int>(
                name: "ExternalMatchId",
                table: "Matches",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matches_ExternalMatchId",
                table: "Matches",
                column: "ExternalMatchId",
                unique: true,
                filter: "\"ExternalMatchId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Matches_ExternalMatchId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "ExternalMatchId",
                table: "Matches");

            migrationBuilder.AlterColumn<Guid>(
                name: "GameWeekId",
                table: "Matches",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
