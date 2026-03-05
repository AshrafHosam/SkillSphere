using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillSphere.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AttendanceModuleOverhaul : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GracePeriodMinutes",
                table: "SchoolTenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EditReason",
                table: "AttendanceRecords",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastEditedAt",
                table: "AttendanceRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastEditedBy",
                table: "AttendanceRecords",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubmissionStatus",
                table: "AttendanceRecords",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "AttendanceRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TimetableEntryId",
                table: "AttendanceRecords",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AttendanceEditPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TeacherProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    TimetableEntryId = table.Column<Guid>(type: "uuid", nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GrantedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    GrantedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SchoolTenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceEditPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceEditPermissions_SchoolTenants_SchoolTenantId",
                        column: x => x.SchoolTenantId,
                        principalTable: "SchoolTenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttendanceEditPermissions_TeacherProfiles_TeacherProfileId",
                        column: x => x.TeacherProfileId,
                        principalTable: "TeacherProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttendanceEditPermissions_TimetableEntries_TimetableEntryId",
                        column: x => x.TimetableEntryId,
                        principalTable: "TimetableEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_StudentProfileId_TimetableEntryId_Date",
                table: "AttendanceRecords",
                columns: new[] { "StudentProfileId", "TimetableEntryId", "Date" },
                unique: true,
                filter: "\"TimetableEntryId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_TimetableEntryId",
                table: "AttendanceRecords",
                column: "TimetableEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceEditPermissions_SchoolTenantId_TeacherProfileId_T~",
                table: "AttendanceEditPermissions",
                columns: new[] { "SchoolTenantId", "TeacherProfileId", "TimetableEntryId", "ValidFrom" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceEditPermissions_TeacherProfileId",
                table: "AttendanceEditPermissions",
                column: "TeacherProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceEditPermissions_TimetableEntryId",
                table: "AttendanceEditPermissions",
                column: "TimetableEntryId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_TimetableEntries_TimetableEntryId",
                table: "AttendanceRecords",
                column: "TimetableEntryId",
                principalTable: "TimetableEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_TimetableEntries_TimetableEntryId",
                table: "AttendanceRecords");

            migrationBuilder.DropTable(
                name: "AttendanceEditPermissions");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_StudentProfileId_TimetableEntryId_Date",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_TimetableEntryId",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "GracePeriodMinutes",
                table: "SchoolTenants");

            migrationBuilder.DropColumn(
                name: "EditReason",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "LastEditedAt",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "LastEditedBy",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "SubmissionStatus",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "TimetableEntryId",
                table: "AttendanceRecords");
        }
    }
}
