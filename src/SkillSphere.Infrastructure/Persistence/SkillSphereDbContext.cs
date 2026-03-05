using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SkillSphere.Domain.Common;
using SkillSphere.Domain.Entities;

namespace SkillSphere.Infrastructure.Persistence;

public class SkillSphereDbContext : DbContext
{
    public SkillSphereDbContext(DbContextOptions<SkillSphereDbContext> options) : base(options) { }

    public DbSet<SchoolTenant> SchoolTenants => Set<SchoolTenant>();
    public DbSet<FeatureFlag> FeatureFlags => Set<FeatureFlag>();
    public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();
    public DbSet<TeacherProfile> TeacherProfiles => Set<TeacherProfile>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<ParentProfile> ParentProfiles => Set<ParentProfile>();
    public DbSet<ParentLink> ParentLinks => Set<ParentLink>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Semester> Semesters => Set<Semester>();
    public DbSet<SupervisorScope> SupervisorScopes => Set<SupervisorScope>();
    public DbSet<StudentAssignment> StudentAssignments => Set<StudentAssignment>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<PeriodDefinition> PeriodDefinitions => Set<PeriodDefinition>();
    public DbSet<CurriculumContract> CurriculumContracts => Set<CurriculumContract>();
    public DbSet<TeacherSubjectLink> TeacherSubjectLinks => Set<TeacherSubjectLink>();
    public DbSet<TimetableVersion> TimetableVersions => Set<TimetableVersion>();
    public DbSet<TimetableEntry> TimetableEntries => Set<TimetableEntry>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<AttendanceEditPermission> AttendanceEditPermissions => Set<AttendanceEditPermission>();
    public DbSet<GradeRecord> GradeRecords => Set<GradeRecord>();
    public DbSet<BehaviorFeedback> BehaviorFeedbacks => Set<BehaviorFeedback>();
    public DbSet<PerformanceAttributeDefinition> PerformanceAttributeDefinitions => Set<PerformanceAttributeDefinition>();
    public DbSet<WeeklyReport> WeeklyReports => Set<WeeklyReport>();
    public DbSet<WeeklyReportItem> WeeklyReportItems => Set<WeeklyReportItem>();
    public DbSet<InternalReport> InternalReports => Set<InternalReport>();
    public DbSet<InternalReportComment> InternalReportComments => Set<InternalReportComment>();
    public DbSet<NotificationEvent> NotificationEvents => Set<NotificationEvent>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global query filter for soft delete
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(
                    CreateSoftDeleteFilter(entityType.ClrType));
            }
        }

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SkillSphereDbContext).Assembly);

        // Ensure all DateTime properties are stored/read as UTC
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(dateTimeConverter);
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(nullableDateTimeConverter);
            }
        }
    }

    private static System.Linq.Expressions.LambdaExpression CreateSoftDeleteFilter(Type entityType)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var condition = System.Linq.Expressions.Expression.Equal(property, System.Linq.Expressions.Expression.Constant(false));
        return System.Linq.Expressions.Expression.Lambda(condition, parameter);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
