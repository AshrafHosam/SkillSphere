using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SkillSphere.Domain.Entities;

namespace SkillSphere.Infrastructure.Persistence.Configurations;

public class SchoolTenantConfig : IEntityTypeConfiguration<SchoolTenant>
{
    public void Configure(EntityTypeBuilder<SchoolTenant> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.Property(x => x.Email).HasMaxLength(200);
        b.Property(x => x.Phone).HasMaxLength(50);
    }
}

public class ApplicationUserConfig : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.Email).IsUnique();
        b.Property(x => x.Email).HasMaxLength(200).IsRequired();
        b.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
        b.Property(x => x.LastName).HasMaxLength(100).IsRequired();
        b.Property(x => x.Phone).HasMaxLength(50);
        b.Ignore(x => x.FullName);

        b.HasOne(x => x.SchoolTenant)
            .WithMany(s => s.Users)
            .HasForeignKey(x => x.SchoolTenantId)
            .OnDelete(DeleteBehavior.SetNull);

        b.HasOne(x => x.TeacherProfile)
            .WithOne(t => t.User)
            .HasForeignKey<TeacherProfile>(t => t.UserId);

        b.HasOne(x => x.StudentProfile)
            .WithOne(s => s.User)
            .HasForeignKey<StudentProfile>(s => s.UserId);

        b.HasOne(x => x.ParentProfile)
            .WithOne(p => p.User)
            .HasForeignKey<ParentProfile>(p => p.UserId);
    }
}

public class FeatureFlagConfig : IEntityTypeConfiguration<FeatureFlag>
{
    public void Configure(EntityTypeBuilder<FeatureFlag> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.SchoolTenantId, x.FeatureType }).IsUnique();
    }
}

public class TeacherProfileConfig : IEntityTypeConfiguration<TeacherProfile>
{
    public void Configure(EntityTypeBuilder<TeacherProfile> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.EmployeeId).HasMaxLength(50);
    }
}

public class StudentProfileConfig : IEntityTypeConfiguration<StudentProfile>
{
    public void Configure(EntityTypeBuilder<StudentProfile> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.StudentNumber).HasMaxLength(50);
    }
}

public class ParentLinkConfig : IEntityTypeConfiguration<ParentLink>
{
    public void Configure(EntityTypeBuilder<ParentLink> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.ParentProfileId, x.StudentProfileId }).IsUnique();

        b.HasOne(x => x.ParentProfile)
            .WithMany(p => p.ParentLinks)
            .HasForeignKey(x => x.ParentProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.StudentProfile)
            .WithMany(s => s.ParentLinks)
            .HasForeignKey(x => x.StudentProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class GradeConfig : IEntityTypeConfiguration<Grade>
{
    public void Configure(EntityTypeBuilder<Grade> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(100).IsRequired();
    }
}

public class GroupConfig : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(100).IsRequired();
        b.HasOne(x => x.Grade).WithMany(g => g.Groups).HasForeignKey(x => x.GradeId);
    }
}

public class SubjectConfig : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        b.Property(x => x.Code).HasMaxLength(50);
        b.HasOne(x => x.Department).WithMany(d => d.Subjects).HasForeignKey(x => x.DepartmentId);
    }
}

public class DepartmentConfig : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
    }
}

public class SemesterConfig : IEntityTypeConfiguration<Semester>
{
    public void Configure(EntityTypeBuilder<Semester> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
    }
}

public class StudentAssignmentConfig : IEntityTypeConfiguration<StudentAssignment>
{
    public void Configure(EntityTypeBuilder<StudentAssignment> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.StudentProfileId, x.SemesterId }).IsUnique();
    }
}

public class RoomConfig : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => new { x.SchoolTenantId, x.Code }).IsUnique();
    }
}

public class PeriodDefinitionConfig : IEntityTypeConfiguration<PeriodDefinition>
{
    public void Configure(EntityTypeBuilder<PeriodDefinition> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Label).HasMaxLength(100);
        b.HasIndex(x => new { x.SchoolTenantId, x.PeriodNumber }).IsUnique();
    }
}

public class CurriculumContractConfig : IEntityTypeConfiguration<CurriculumContract>
{
    public void Configure(EntityTypeBuilder<CurriculumContract> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.SchoolTenantId, x.GradeId, x.SemesterId, x.SubjectId }).IsUnique();
    }
}

public class TeacherSubjectLinkConfig : IEntityTypeConfiguration<TeacherSubjectLink>
{
    public void Configure(EntityTypeBuilder<TeacherSubjectLink> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.SchoolTenantId, x.TeacherProfileId, x.SubjectId, x.GradeId }).IsUnique();
    }
}

public class TimetableVersionConfig : IEntityTypeConfiguration<TimetableVersion>
{
    public void Configure(EntityTypeBuilder<TimetableVersion> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Name).HasMaxLength(200);
        b.HasIndex(x => new { x.SchoolTenantId, x.GroupId, x.SemesterId, x.VersionNumber }).IsUnique();
    }
}

public class TimetableEntryConfig : IEntityTypeConfiguration<TimetableEntry>
{
    public void Configure(EntityTypeBuilder<TimetableEntry> b)
    {
        b.HasKey(x => x.Id);
        b.HasOne(x => x.TimetableVersion).WithMany(v => v.Entries).HasForeignKey(x => x.TimetableVersionId);
        b.HasOne(x => x.TeacherProfile).WithMany(t => t.TimetableEntries).HasForeignKey(x => x.TeacherProfileId);
        b.HasOne(x => x.Room).WithMany(r => r.TimetableEntries).HasForeignKey(x => x.RoomId);
        b.HasOne(x => x.PeriodDefinition).WithMany(p => p.TimetableEntries).HasForeignKey(x => x.PeriodDefinitionId);
        b.HasIndex(x => new { x.TimetableVersionId, x.DayOfWeek, x.PeriodDefinitionId }).IsUnique();
    }
}

public class AttendanceRecordConfig : IEntityTypeConfiguration<AttendanceRecord>
{
    public void Configure(EntityTypeBuilder<AttendanceRecord> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.StudentProfileId, x.TimetableEntryId, x.Date }).IsUnique()
            .HasFilter("\"TimetableEntryId\" IS NOT NULL");
        b.HasIndex(x => new { x.StudentProfileId, x.SubjectId, x.Date, x.SessionTime });
        b.Property(x => x.EditReason).HasMaxLength(1000);
        b.Property(x => x.LastEditedBy).HasMaxLength(200);

        b.HasOne(x => x.TimetableEntry)
            .WithMany()
            .HasForeignKey(x => x.TimetableEntryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class AttendanceEditPermissionConfig : IEntityTypeConfiguration<AttendanceEditPermission>
{
    public void Configure(EntityTypeBuilder<AttendanceEditPermission> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.SchoolTenantId, x.TeacherProfileId, x.TimetableEntryId, x.ValidFrom }).IsUnique();
        b.Property(x => x.GrantedByName).HasMaxLength(200).IsRequired();
        b.Property(x => x.Reason).HasMaxLength(1000).IsRequired();

        b.HasOne(x => x.TeacherProfile)
            .WithMany()
            .HasForeignKey(x => x.TeacherProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.TimetableEntry)
            .WithMany()
            .HasForeignKey(x => x.TimetableEntryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class WeeklyReportConfig : IEntityTypeConfiguration<WeeklyReport>
{
    public void Configure(EntityTypeBuilder<WeeklyReport> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.StudentProfileId, x.SubjectId, x.SemesterId, x.WeekNumber }).IsUnique();
        b.HasMany(x => x.Items).WithOne(i => i.WeeklyReport).HasForeignKey(i => i.WeeklyReportId);
    }
}

public class InternalReportConfig : IEntityTypeConfiguration<InternalReport>
{
    public void Configure(EntityTypeBuilder<InternalReport> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(500).IsRequired();
        b.HasMany(x => x.Comments).WithOne(c => c.InternalReport).HasForeignKey(c => c.InternalReportId);

        b.HasOne(x => x.ReporterTeacher)
            .WithMany()
            .HasForeignKey(x => x.ReporterTeacherProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.AssignedSupervisor)
            .WithMany()
            .HasForeignKey(x => x.AssignedSupervisorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AuditLogConfig : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.CreatedAt);
        b.HasIndex(x => x.SchoolTenantId);
        b.HasIndex(x => x.UserId);
        b.Property(x => x.EntityType).HasMaxLength(200);
    }
}
