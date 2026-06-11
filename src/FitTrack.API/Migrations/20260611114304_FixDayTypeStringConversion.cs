using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitTrack.API.Migrations
{
    /// <inheritdoc />
    public partial class FixDayTypeStringConversion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        UPDATE ""PlanDays"" SET ""DayType"" = CASE ""DayType""
            WHEN '0' THEN 'Chest'
            WHEN '1' THEN 'Back'
            WHEN '2' THEN 'Abs'
            WHEN '3' THEN 'Rest'
            ELSE ""DayType""
        END
        WHERE ""DayType"" IN ('0', '1', '2', '3');
    ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        UPDATE ""PlanDays"" SET ""DayType"" = CASE ""DayType""
            WHEN 'Chest' THEN '0'
            WHEN 'Back' THEN '1'
            WHEN 'Abs' THEN '2'
            WHEN 'Rest' THEN '3'
            ELSE ""DayType""
        END;
    ");
        }
    }
}
