using SkillSphere.Domain.Entities;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    /// <summary>
    /// Seeds the database with comprehensive mock data for all roles and screens.
    /// Only runs if no users exist (fresh database).
    /// </summary>
    public static void Seed(SkillSphereDbContext db)
    {
        if (db.ApplicationUsers.Any()) return;

        var now = DateTime.UtcNow;
        var hash = (string pw) => BCrypt.Net.BCrypt.HashPassword(pw);

        // ───────────────────────────────────────────────
        // 1. PLATFORM SUPER ADMIN
        // ───────────────────────────────────────────────
        var superAdmin = new ApplicationUser
        {
            Email = "superadmin@skillsphere.com",
            PasswordHash = hash("Admin@123"),
            FirstName = "Platform",
            LastName = "Admin",
            Role = UserRole.PlatformSuperAdmin,
            SchoolTenantId = null
        };
        db.ApplicationUsers.Add(superAdmin);

        // ───────────────────────────────────────────────
        // 2. SCHOOL TENANT
        // ───────────────────────────────────────────────
        var school = new SchoolTenant
        {
            Name = "Al-Noor International Academy",
            Code = "ALNOOR01",
            Address = "123 Knowledge Avenue, Riyadh",
            Phone = "+966-11-555-1234",
            Email = "info@alnoor.edu.sa",
            Timezone = "Asia/Riyadh",
            IsActive = true
        };
        db.SchoolTenants.Add(school);

        // Feature flags — enable all for demo
        foreach (FeatureType ft in Enum.GetValues<FeatureType>())
        {
            db.FeatureFlags.Add(new FeatureFlag
            {
                SchoolTenantId = school.Id,
                FeatureType = ft,
                IsEnabled = true
            });
        }

        // ───────────────────────────────────────────────
        // 3. DEPARTMENTS
        // ───────────────────────────────────────────────
        var deptScience = new Department { SchoolTenantId = school.Id, Name = "Science", Description = "Physics, Chemistry, Biology" };
        var deptMath = new Department { SchoolTenantId = school.Id, Name = "Mathematics", Description = "Algebra, Geometry, Calculus" };
        var deptLang = new Department { SchoolTenantId = school.Id, Name = "Languages", Description = "Arabic, English, French" };
        var deptIS = new Department { SchoolTenantId = school.Id, Name = "Islamic Studies", Description = "Quran, Fiqh, Hadith" };
        db.Departments.AddRange(deptScience, deptMath, deptLang, deptIS);

        // ───────────────────────────────────────────────
        // 4. SUBJECTS
        // ───────────────────────────────────────────────
        var subMath = new Subject { SchoolTenantId = school.Id, Name = "Mathematics", Code = "MATH", DepartmentId = deptMath.Id };
        var subPhysics = new Subject { SchoolTenantId = school.Id, Name = "Physics", Code = "PHY", DepartmentId = deptScience.Id, RequiredRoomType = RoomType.ScienceLab };
        var subChemistry = new Subject { SchoolTenantId = school.Id, Name = "Chemistry", Code = "CHEM", DepartmentId = deptScience.Id, RequiredRoomType = RoomType.ScienceLab };
        var subBiology = new Subject { SchoolTenantId = school.Id, Name = "Biology", Code = "BIO", DepartmentId = deptScience.Id, RequiredRoomType = RoomType.ScienceLab };
        var subArabic = new Subject { SchoolTenantId = school.Id, Name = "Arabic", Code = "AR", DepartmentId = deptLang.Id };
        var subEnglish = new Subject { SchoolTenantId = school.Id, Name = "English", Code = "ENG", DepartmentId = deptLang.Id };
        var subQuran = new Subject { SchoolTenantId = school.Id, Name = "Quran Studies", Code = "QRN", DepartmentId = deptIS.Id };
        var subCS = new Subject { SchoolTenantId = school.Id, Name = "Computer Science", Code = "CS", DepartmentId = null, RequiredRoomType = RoomType.ComputerLab };
        db.Subjects.AddRange(subMath, subPhysics, subChemistry, subBiology, subArabic, subEnglish, subQuran, subCS);

        // ───────────────────────────────────────────────
        // 5. GRADES & GROUPS (was CLASS SECTIONS)
        // ───────────────────────────────────────────────
        var grade9 = new Grade { SchoolTenantId = school.Id, Name = "Grade 9", OrderIndex = 9 };
        var grade10 = new Grade { SchoolTenantId = school.Id, Name = "Grade 10", OrderIndex = 10 };
        var grade11 = new Grade { SchoolTenantId = school.Id, Name = "Grade 11", OrderIndex = 11 };
        db.Grades.AddRange(grade9, grade10, grade11);

        var grp9A = new Group { SchoolTenantId = school.Id, Name = "9-A", GradeId = grade9.Id, Capacity = 30 };
        var grp9B = new Group { SchoolTenantId = school.Id, Name = "9-B", GradeId = grade9.Id, Capacity = 30 };
        var grp10A = new Group { SchoolTenantId = school.Id, Name = "10-A", GradeId = grade10.Id, Capacity = 28 };
        var grp10B = new Group { SchoolTenantId = school.Id, Name = "10-B", GradeId = grade10.Id, Capacity = 28 };
        var grp11A = new Group { SchoolTenantId = school.Id, Name = "11-A", GradeId = grade11.Id, Capacity = 25 };
        db.Groups.AddRange(grp9A, grp9B, grp10A, grp10B, grp11A);

        // ───────────────────────────────────────────────
        // 6. SEMESTERS
        // ───────────────────────────────────────────────
        var sem1 = new Semester
        {
            SchoolTenantId = school.Id,
            Name = "2025-2026 Term 1",
            StartDate = new DateTime(2025, 9, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 1, 31, 0, 0, 0, DateTimeKind.Utc),
            IsCurrent = true
        };
        var sem2 = new Semester
        {
            SchoolTenantId = school.Id,
            Name = "2025-2026 Term 2",
            StartDate = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc),
            IsCurrent = false
        };
        db.Semesters.AddRange(sem1, sem2);

        // ───────────────────────────────────────────────
        // 7. PERFORMANCE ATTRIBUTE DEFINITIONS
        // ───────────────────────────────────────────────
        var perfAttrs = new[]
        {
            new PerformanceAttributeDefinition { SchoolTenantId = school.Id, Name = "Academic Performance", OrderIndex = 1, Description = "Overall academic grade" },
            new PerformanceAttributeDefinition { SchoolTenantId = school.Id, Name = "Behavior", OrderIndex = 2, Description = "Classroom behavior and conduct" },
            new PerformanceAttributeDefinition { SchoolTenantId = school.Id, Name = "Participation", OrderIndex = 3, Description = "Active class participation" },
            new PerformanceAttributeDefinition { SchoolTenantId = school.Id, Name = "Homework", OrderIndex = 4, Description = "Homework completion rate" },
            new PerformanceAttributeDefinition { SchoolTenantId = school.Id, Name = "Attendance", OrderIndex = 5, Description = "Regular attendance" },
        };
        db.PerformanceAttributeDefinitions.AddRange(perfAttrs);

        // ───────────────────────────────────────────────
        // 8. USERS — SCHOOL ADMIN
        // ───────────────────────────────────────────────
        var schoolAdmin = new ApplicationUser
        {
            Email = "admin@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Khalid",
            LastName = "Al-Farsi",
            Phone = "+966-50-111-0001",
            Role = UserRole.SchoolAdmin,
            SchoolTenantId = school.Id
        };
        db.ApplicationUsers.Add(schoolAdmin);

        // ───────────────────────────────────────────────
        // 9. USERS — SCHOOL MANAGER
        // ───────────────────────────────────────────────
        var manager = new ApplicationUser
        {
            Email = "manager@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Sara",
            LastName = "Al-Qahtani",
            Phone = "+966-50-111-0002",
            Role = UserRole.SchoolManager,
            SchoolTenantId = school.Id
        };
        db.ApplicationUsers.Add(manager);

        // ───────────────────────────────────────────────
        // 10. USERS — TEACHERS (4 teachers)
        // ───────────────────────────────────────────────
        var teacherAhmed = new ApplicationUser
        {
            Email = "ahmed.teacher@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Ahmed",
            LastName = "Hassan",
            Phone = "+966-50-222-0001",
            Role = UserRole.Teacher,
            SchoolTenantId = school.Id
        };
        var teacherFatima = new ApplicationUser
        {
            Email = "fatima.teacher@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Fatima",
            LastName = "Al-Rashid",
            Phone = "+966-50-222-0002",
            Role = UserRole.Teacher,
            SchoolTenantId = school.Id
        };
        var teacherOmar = new ApplicationUser
        {
            Email = "omar.teacher@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Omar",
            LastName = "Mahmoud",
            Phone = "+966-50-222-0003",
            Role = UserRole.Teacher,
            SchoolTenantId = school.Id
        };
        var teacherNoor = new ApplicationUser
        {
            Email = "noor.teacher@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Noor",
            LastName = "Al-Sayed",
            Phone = "+966-50-222-0004",
            Role = UserRole.Teacher,
            SchoolTenantId = school.Id
        };
        db.ApplicationUsers.AddRange(teacherAhmed, teacherFatima, teacherOmar, teacherNoor);

        // Teacher profiles
        var tpAhmed = new TeacherProfile { SchoolTenantId = school.Id, UserId = teacherAhmed.Id, EmployeeId = "T001", Specialization = "Mathematics", IsSupervisor = false };
        var tpFatima = new TeacherProfile { SchoolTenantId = school.Id, UserId = teacherFatima.Id, EmployeeId = "T002", Specialization = "Science", IsSupervisor = false };
        var tpOmar = new TeacherProfile { SchoolTenantId = school.Id, UserId = teacherOmar.Id, EmployeeId = "T003", Specialization = "Arabic & Islamic Studies", IsSupervisor = false };
        var tpNoor = new TeacherProfile { SchoolTenantId = school.Id, UserId = teacherNoor.Id, EmployeeId = "T004", Specialization = "English & Computer Science", IsSupervisor = false };
        db.TeacherProfiles.AddRange(tpAhmed, tpFatima, tpOmar, tpNoor);

        // ───────────────────────────────────────────────
        // 11. USERS — TEACHER SUPERVISOR
        // ───────────────────────────────────────────────
        var supervisorUser = new ApplicationUser
        {
            Email = "supervisor@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Yusuf",
            LastName = "Al-Mansoor",
            Phone = "+966-50-333-0001",
            Role = UserRole.TeacherSupervisor,
            SchoolTenantId = school.Id
        };
        db.ApplicationUsers.Add(supervisorUser);

        var tpSupervisor = new TeacherProfile { SchoolTenantId = school.Id, UserId = supervisorUser.Id, EmployeeId = "S001", Specialization = "Science Department Head", IsSupervisor = true };
        db.TeacherProfiles.Add(tpSupervisor);

        // Supervisor scopes — oversees Science dept + Grade 10
        db.SupervisorScopes.AddRange(
            new SupervisorScope { SchoolTenantId = school.Id, TeacherProfileId = tpSupervisor.Id, DepartmentId = deptScience.Id },
            new SupervisorScope { SchoolTenantId = school.Id, TeacherProfileId = tpSupervisor.Id, GradeId = grade10.Id }
        );

        // ───────────────────────────────────────────────
        // 12. USERS — STUDENTS (6 students)
        // ───────────────────────────────────────────────
        ApplicationUser MakeStudentUser(string email, string first, string last, string phone) =>
            new() { Email = email, PasswordHash = hash("Admin@123"), FirstName = first, LastName = last, Phone = phone, Role = UserRole.Student, SchoolTenantId = school.Id };

        var stu1User = MakeStudentUser("ali.student@alnoor.edu.sa", "Ali", "Al-Bakr", "+966-50-444-0001");
        var stu2User = MakeStudentUser("layla.student@alnoor.edu.sa", "Layla", "Hassan", "+966-50-444-0002");
        var stu3User = MakeStudentUser("sami.student@alnoor.edu.sa", "Sami", "Al-Zahrani", "+966-50-444-0003");
        var stu4User = MakeStudentUser("reem.student@alnoor.edu.sa", "Reem", "Khaled", "+966-50-444-0004");
        var stu5User = MakeStudentUser("mohammed.student@alnoor.edu.sa", "Mohammed", "Ibrahim", "+966-50-444-0005");
        var stu6User = MakeStudentUser("hana.student@alnoor.edu.sa", "Hana", "Al-Otaibi", "+966-50-444-0006");
        db.ApplicationUsers.AddRange(stu1User, stu2User, stu3User, stu4User, stu5User, stu6User);

        var sp1 = new StudentProfile { SchoolTenantId = school.Id, UserId = stu1User.Id, StudentNumber = "STU-2025-001", DateOfBirth = new DateTime(2010, 3, 15, 0, 0, 0, DateTimeKind.Utc), Gender = "Male" };
        var sp2 = new StudentProfile { SchoolTenantId = school.Id, UserId = stu2User.Id, StudentNumber = "STU-2025-002", DateOfBirth = new DateTime(2010, 7, 22, 0, 0, 0, DateTimeKind.Utc), Gender = "Female" };
        var sp3 = new StudentProfile { SchoolTenantId = school.Id, UserId = stu3User.Id, StudentNumber = "STU-2025-003", DateOfBirth = new DateTime(2009, 11, 8, 0, 0, 0, DateTimeKind.Utc), Gender = "Male" };
        var sp4 = new StudentProfile { SchoolTenantId = school.Id, UserId = stu4User.Id, StudentNumber = "STU-2025-004", DateOfBirth = new DateTime(2009, 5, 30, 0, 0, 0, DateTimeKind.Utc), Gender = "Female" };
        var sp5 = new StudentProfile { SchoolTenantId = school.Id, UserId = stu5User.Id, StudentNumber = "STU-2025-005", DateOfBirth = new DateTime(2008, 1, 12, 0, 0, 0, DateTimeKind.Utc), Gender = "Male" };
        var sp6 = new StudentProfile { SchoolTenantId = school.Id, UserId = stu6User.Id, StudentNumber = "STU-2025-006", DateOfBirth = new DateTime(2008, 9, 3, 0, 0, 0, DateTimeKind.Utc), Gender = "Female" };
        db.StudentProfiles.AddRange(sp1, sp2, sp3, sp4, sp5, sp6);

        // ───────────────────────────────────────────────
        // 13. USERS — PARENTS (3 parents)
        // ───────────────────────────────────────────────
        var parent1User = new ApplicationUser
        {
            Email = "parent.bakr@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Abdullah",
            LastName = "Al-Bakr",
            Phone = "+966-50-555-0001",
            Role = UserRole.Parent,
            SchoolTenantId = school.Id
        };
        var parent2User = new ApplicationUser
        {
            Email = "parent.hassan@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Mariam",
            LastName = "Hassan",
            Phone = "+966-50-555-0002",
            Role = UserRole.Parent,
            SchoolTenantId = school.Id
        };
        var parent3User = new ApplicationUser
        {
            Email = "parent.khaled@alnoor.edu.sa",
            PasswordHash = hash("Admin@123"),
            FirstName = "Tariq",
            LastName = "Khaled",
            Phone = "+966-50-555-0003",
            Role = UserRole.Parent,
            SchoolTenantId = school.Id
        };
        db.ApplicationUsers.AddRange(parent1User, parent2User, parent3User);

        var pp1 = new ParentProfile { SchoolTenantId = school.Id, UserId = parent1User.Id, Relationship = "Father" };
        var pp2 = new ParentProfile { SchoolTenantId = school.Id, UserId = parent2User.Id, Relationship = "Mother" };
        var pp3 = new ParentProfile { SchoolTenantId = school.Id, UserId = parent3User.Id, Relationship = "Father" };
        db.ParentProfiles.AddRange(pp1, pp2, pp3);

        // Parent links: parent1 → Ali (stu1), parent2 → Layla (stu2), parent3 → Reem (stu4) + Sami (stu3)
        db.ParentLinks.AddRange(
            new ParentLink { SchoolTenantId = school.Id, ParentProfileId = pp1.Id, StudentProfileId = sp1.Id, IsPrimary = true },
            new ParentLink { SchoolTenantId = school.Id, ParentProfileId = pp2.Id, StudentProfileId = sp2.Id, IsPrimary = true },
            new ParentLink { SchoolTenantId = school.Id, ParentProfileId = pp3.Id, StudentProfileId = sp3.Id, IsPrimary = true },
            new ParentLink { SchoolTenantId = school.Id, ParentProfileId = pp3.Id, StudentProfileId = sp4.Id, IsPrimary = false }
        );

        // ───────────────────────────────────────────────
        // 14. ROOMS
        // ───────────────────────────────────────────────
        var room101 = new Room { SchoolTenantId = school.Id, Name = "Room 101", Code = "R101", RoomType = RoomType.Classroom, Capacity = 35, Building = "Main", Floor = 1 };
        var room102 = new Room { SchoolTenantId = school.Id, Name = "Room 102", Code = "R102", RoomType = RoomType.Classroom, Capacity = 35, Building = "Main", Floor = 1 };
        var room103 = new Room { SchoolTenantId = school.Id, Name = "Room 103", Code = "R103", RoomType = RoomType.Classroom, Capacity = 35, Building = "Main", Floor = 1 };
        var room201 = new Room { SchoolTenantId = school.Id, Name = "Room 201", Code = "R201", RoomType = RoomType.Classroom, Capacity = 30, Building = "Main", Floor = 2 };
        var room202 = new Room { SchoolTenantId = school.Id, Name = "Room 202", Code = "R202", RoomType = RoomType.Classroom, Capacity = 30, Building = "Main", Floor = 2 };
        var lab1 = new Room { SchoolTenantId = school.Id, Name = "Science Lab 1", Code = "LAB1", RoomType = RoomType.ScienceLab, Capacity = 25, Building = "Science", Floor = 1 };
        var lab2 = new Room { SchoolTenantId = school.Id, Name = "Science Lab 2", Code = "LAB2", RoomType = RoomType.ScienceLab, Capacity = 25, Building = "Science", Floor = 1 };
        var itLab = new Room { SchoolTenantId = school.Id, Name = "IT Lab", Code = "ITLAB", RoomType = RoomType.ComputerLab, Capacity = 30, Building = "Tech", Floor = 1 };
        var artRoom = new Room { SchoolTenantId = school.Id, Name = "Art Room", Code = "ART1", RoomType = RoomType.ArtRoom, Capacity = 25, Building = "Main", Floor = 1 };
        var gym = new Room { SchoolTenantId = school.Id, Name = "Gymnasium", Code = "GYM1", RoomType = RoomType.Gymnasium, Capacity = 60, Building = "Sports", Floor = 1 };
        db.Rooms.AddRange(room101, room102, room103, room201, room202, lab1, lab2, itLab, artRoom, gym);

        // ───────────────────────────────────────────────
        // 14b. PERIOD DEFINITIONS
        // ───────────────────────────────────────────────
        var p1 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 1, Label = "Period 1", StartTime = new TimeSpan(7, 30, 0), EndTime = new TimeSpan(8, 15, 0) };
        var p2 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 2, Label = "Period 2", StartTime = new TimeSpan(8, 20, 0), EndTime = new TimeSpan(9, 5, 0) };
        var pBreak1 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 3, Label = "Break", StartTime = new TimeSpan(9, 5, 0), EndTime = new TimeSpan(9, 25, 0), IsBreak = true };
        var p3 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 4, Label = "Period 3", StartTime = new TimeSpan(9, 25, 0), EndTime = new TimeSpan(10, 10, 0) };
        var p4 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 5, Label = "Period 4", StartTime = new TimeSpan(10, 15, 0), EndTime = new TimeSpan(11, 0, 0) };
        var p5 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 6, Label = "Period 5", StartTime = new TimeSpan(11, 5, 0), EndTime = new TimeSpan(11, 50, 0) };
        var pBreak2 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 7, Label = "Break", StartTime = new TimeSpan(11, 50, 0), EndTime = new TimeSpan(12, 20, 0), IsBreak = true };
        var p6 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 8, Label = "Period 6", StartTime = new TimeSpan(12, 20, 0), EndTime = new TimeSpan(13, 5, 0) };
        var p7 = new PeriodDefinition { SchoolTenantId = school.Id, PeriodNumber = 9, Label = "Period 7", StartTime = new TimeSpan(13, 10, 0), EndTime = new TimeSpan(13, 55, 0) };
        db.PeriodDefinitions.AddRange(p1, p2, pBreak1, p3, p4, p5, pBreak2, p6, p7);

        // ───────────────────────────────────────────────
        // 14c. TEACHER SUBJECT LINKS (who can teach what)
        // ───────────────────────────────────────────────
        db.TeacherSubjectLinks.AddRange(
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpAhmed.Id, SubjectId = subMath.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpFatima.Id, SubjectId = subPhysics.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpFatima.Id, SubjectId = subChemistry.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpFatima.Id, SubjectId = subBiology.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpOmar.Id, SubjectId = subArabic.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpOmar.Id, SubjectId = subQuran.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpNoor.Id, SubjectId = subEnglish.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpNoor.Id, SubjectId = subCS.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpSupervisor.Id, SubjectId = subPhysics.Id, IsActive = true },
            new TeacherSubjectLink { SchoolTenantId = school.Id, TeacherProfileId = tpSupervisor.Id, SubjectId = subBiology.Id, IsActive = true }
        );

        // ───────────────────────────────────────────────
        // 14d. CURRICULUM CONTRACTS
        // ───────────────────────────────────────────────
        db.CurriculumContracts.AddRange(
            // Grade 9, Semester 1: Math 5, Arabic 4, English 4, Physics 3, Biology 2, Quran 2, CS 2
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade9.Id, SemesterId = sem1.Id, SubjectId = subMath.Id, PeriodsPerWeek = 5 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade9.Id, SemesterId = sem1.Id, SubjectId = subArabic.Id, PeriodsPerWeek = 4 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade9.Id, SemesterId = sem1.Id, SubjectId = subEnglish.Id, PeriodsPerWeek = 4 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade9.Id, SemesterId = sem1.Id, SubjectId = subPhysics.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade9.Id, SemesterId = sem1.Id, SubjectId = subBiology.Id, PeriodsPerWeek = 2 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade9.Id, SemesterId = sem1.Id, SubjectId = subQuran.Id, PeriodsPerWeek = 2 },
            // Grade 10, Semester 1: Math 5, Physics 4, Arabic 3, Quran 2, English 3, Chemistry 3, CS 2
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subMath.Id, PeriodsPerWeek = 5 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subPhysics.Id, PeriodsPerWeek = 4 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subArabic.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subQuran.Id, PeriodsPerWeek = 2 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subEnglish.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subChemistry.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade10.Id, SemesterId = sem1.Id, SubjectId = subCS.Id, PeriodsPerWeek = 2 },
            // Grade 11, Semester 1: Math 5, Chemistry 4, CS 3, English 3, Arabic 3, Physics 3, Biology 2, Quran 2
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subMath.Id, PeriodsPerWeek = 5 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subChemistry.Id, PeriodsPerWeek = 4 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subCS.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subEnglish.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subArabic.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subPhysics.Id, PeriodsPerWeek = 3 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subBiology.Id, PeriodsPerWeek = 2 },
            new CurriculumContract { SchoolTenantId = school.Id, GradeId = grade11.Id, SemesterId = sem1.Id, SubjectId = subQuran.Id, PeriodsPerWeek = 2 }
        );

        // ───────────────────────────────────────────────
        // 15. STUDENT ASSIGNMENTS (who is in which group)
        // ───────────────────────────────────────────────
        // Ali + Layla → 9A; Sami → 9B
        db.StudentAssignments.AddRange(
            new StudentAssignment { SchoolTenantId = school.Id, StudentProfileId = sp1.Id, GradeId = grade9.Id, GroupId = grp9A.Id, SemesterId = sem1.Id },
            new StudentAssignment { SchoolTenantId = school.Id, StudentProfileId = sp2.Id, GradeId = grade9.Id, GroupId = grp9A.Id, SemesterId = sem1.Id },
            new StudentAssignment { SchoolTenantId = school.Id, StudentProfileId = sp3.Id, GradeId = grade9.Id, GroupId = grp9B.Id, SemesterId = sem1.Id }
        );
        // Reem → 10A; Mohammed → 10B
        db.StudentAssignments.AddRange(
            new StudentAssignment { SchoolTenantId = school.Id, StudentProfileId = sp4.Id, GradeId = grade10.Id, GroupId = grp10A.Id, SemesterId = sem1.Id },
            new StudentAssignment { SchoolTenantId = school.Id, StudentProfileId = sp5.Id, GradeId = grade10.Id, GroupId = grp10B.Id, SemesterId = sem1.Id }
        );
        // Hana → 11A
        db.StudentAssignments.Add(
            new StudentAssignment { SchoolTenantId = school.Id, StudentProfileId = sp6.Id, GradeId = grade11.Id, GroupId = grp11A.Id, SemesterId = sem1.Id }
        );

        // ───────────────────────────────────────────────
        // 16. TIMETABLE (Group-scoped, with Room & PeriodDefinition FKs)
        // ───────────────────────────────────────────────
        // One published version per group
        var tt9A = new TimetableVersion { SchoolTenantId = school.Id, Name = "Term 1 — 9-A", SemesterId = sem1.Id, GroupId = grp9A.Id, VersionNumber = 1, Status = TimetableStatus.Published, PublishedAt = new DateTime(2025, 8, 28, 0, 0, 0, DateTimeKind.Utc), PublishedBy = schoolAdmin.Email };
        var tt9B = new TimetableVersion { SchoolTenantId = school.Id, Name = "Term 1 — 9-B", SemesterId = sem1.Id, GroupId = grp9B.Id, VersionNumber = 1, Status = TimetableStatus.Published, PublishedAt = new DateTime(2025, 8, 28, 0, 0, 0, DateTimeKind.Utc), PublishedBy = schoolAdmin.Email };
        var tt10A = new TimetableVersion { SchoolTenantId = school.Id, Name = "Term 1 — 10-A", SemesterId = sem1.Id, GroupId = grp10A.Id, VersionNumber = 1, Status = TimetableStatus.Published, PublishedAt = new DateTime(2025, 8, 28, 0, 0, 0, DateTimeKind.Utc), PublishedBy = schoolAdmin.Email };
        var tt10B = new TimetableVersion { SchoolTenantId = school.Id, Name = "Term 1 — 10-B", SemesterId = sem1.Id, GroupId = grp10B.Id, VersionNumber = 1, Status = TimetableStatus.Published, PublishedAt = new DateTime(2025, 8, 28, 0, 0, 0, DateTimeKind.Utc), PublishedBy = schoolAdmin.Email };
        var tt11A = new TimetableVersion { SchoolTenantId = school.Id, Name = "Term 1 — 11-A", SemesterId = sem1.Id, GroupId = grp11A.Id, VersionNumber = 1, Status = TimetableStatus.Published, PublishedAt = new DateTime(2025, 8, 28, 0, 0, 0, DateTimeKind.Utc), PublishedBy = schoolAdmin.Email };
        db.TimetableVersions.AddRange(tt9A, tt9B, tt10A, tt10B, tt11A);

        // Helper to add entries using Room + PeriodDefinition FKs
        void AddEntry(TimetableVersion ver, TeacherProfile tp, Subject sub, DayOfWeek day, PeriodDefinition period, Room room)
        {
            db.TimetableEntries.Add(new TimetableEntry
            {
                SchoolTenantId = school.Id,
                TimetableVersionId = ver.Id,
                TeacherProfileId = tp.Id,
                SubjectId = sub.Id,
                DayOfWeek = day,
                PeriodDefinitionId = period.Id,
                RoomId = room.Id
            });
        }

        // Sunday schedule
        AddEntry(tt9A, tpAhmed, subMath, DayOfWeek.Sunday, p1, room101);
        AddEntry(tt10A, tpFatima, subPhysics, DayOfWeek.Sunday, p1, lab1);
        AddEntry(tt9B, tpOmar, subArabic, DayOfWeek.Sunday, p1, room103);
        AddEntry(tt9A, tpNoor, subEnglish, DayOfWeek.Sunday, p2, room101);
        AddEntry(tt10A, tpAhmed, subMath, DayOfWeek.Sunday, p2, room202);
        AddEntry(tt11A, tpFatima, subChemistry, DayOfWeek.Sunday, p2, lab2);
        AddEntry(tt11A, tpNoor, subCS, DayOfWeek.Sunday, p3, itLab);
        AddEntry(tt10A, tpOmar, subQuran, DayOfWeek.Sunday, p3, room201);
        AddEntry(tt9A, tpOmar, subArabic, DayOfWeek.Sunday, p4, room101);
        AddEntry(tt10A, tpNoor, subEnglish, DayOfWeek.Sunday, p4, room202);
        AddEntry(tt11A, tpAhmed, subMath, DayOfWeek.Sunday, p5, room201);
        AddEntry(tt9B, tpFatima, subPhysics, DayOfWeek.Sunday, p5, lab1);

        // Monday schedule
        AddEntry(tt9B, tpAhmed, subMath, DayOfWeek.Monday, p1, room102);
        AddEntry(tt10B, tpFatima, subPhysics, DayOfWeek.Monday, p1, lab1);
        AddEntry(tt10A, tpNoor, subEnglish, DayOfWeek.Monday, p1, room201);
        AddEntry(tt9A, tpOmar, subArabic, DayOfWeek.Monday, p2, room101);
        AddEntry(tt11A, tpFatima, subChemistry, DayOfWeek.Monday, p2, lab2);
        AddEntry(tt9A, tpAhmed, subMath, DayOfWeek.Monday, p3, room101);
        AddEntry(tt10A, tpFatima, subPhysics, DayOfWeek.Monday, p3, lab1);
        AddEntry(tt11A, tpOmar, subArabic, DayOfWeek.Monday, p4, room201);
        AddEntry(tt10A, tpAhmed, subMath, DayOfWeek.Monday, p5, room202);
        AddEntry(tt9A, tpNoor, subEnglish, DayOfWeek.Monday, p6, room101);
        AddEntry(tt11A, tpNoor, subCS, DayOfWeek.Monday, p6, itLab);

        // Tuesday schedule
        AddEntry(tt9A, tpNoor, subEnglish, DayOfWeek.Tuesday, p1, room101);
        AddEntry(tt10A, tpOmar, subQuran, DayOfWeek.Tuesday, p1, room201);
        AddEntry(tt10A, tpAhmed, subMath, DayOfWeek.Tuesday, p2, room202);
        AddEntry(tt11A, tpFatima, subChemistry, DayOfWeek.Tuesday, p2, lab2);
        AddEntry(tt11A, tpNoor, subCS, DayOfWeek.Tuesday, p3, itLab);
        AddEntry(tt9A, tpAhmed, subMath, DayOfWeek.Tuesday, p4, room101);
        AddEntry(tt9B, tpOmar, subArabic, DayOfWeek.Tuesday, p4, room103);
        AddEntry(tt10B, tpFatima, subPhysics, DayOfWeek.Tuesday, p5, lab1);
        AddEntry(tt11A, tpOmar, subQuran, DayOfWeek.Tuesday, p6, room201);

        // Wednesday schedule
        AddEntry(tt9A, tpAhmed, subMath, DayOfWeek.Wednesday, p1, room101);
        AddEntry(tt9B, tpOmar, subArabic, DayOfWeek.Wednesday, p1, room103);
        AddEntry(tt10B, tpFatima, subPhysics, DayOfWeek.Wednesday, p2, lab1);
        AddEntry(tt10A, tpNoor, subEnglish, DayOfWeek.Wednesday, p2, room201);
        AddEntry(tt11A, tpAhmed, subMath, DayOfWeek.Wednesday, p3, room201);
        AddEntry(tt9A, tpFatima, subPhysics, DayOfWeek.Wednesday, p4, lab1);
        AddEntry(tt10A, tpOmar, subArabic, DayOfWeek.Wednesday, p5, room201);
        AddEntry(tt11A, tpNoor, subEnglish, DayOfWeek.Wednesday, p6, room202);

        // Thursday schedule
        AddEntry(tt9A, tpOmar, subQuran, DayOfWeek.Thursday, p1, room101);
        AddEntry(tt10A, tpAhmed, subMath, DayOfWeek.Thursday, p1, room202);
        AddEntry(tt11A, tpFatima, subPhysics, DayOfWeek.Thursday, p1, lab1);
        AddEntry(tt9B, tpAhmed, subMath, DayOfWeek.Thursday, p2, room102);
        AddEntry(tt10A, tpFatima, subChemistry, DayOfWeek.Thursday, p2, lab2);
        AddEntry(tt11A, tpOmar, subArabic, DayOfWeek.Thursday, p3, room201);
        AddEntry(tt9A, tpNoor, subEnglish, DayOfWeek.Thursday, p3, room101);
        AddEntry(tt10B, tpAhmed, subMath, DayOfWeek.Thursday, p4, room202);
        AddEntry(tt11A, tpNoor, subEnglish, DayOfWeek.Thursday, p5, room201);

        // ───────────────────────────────────────────────
        // 17. ATTENDANCE RECORDS (last 2 weeks of data)
        // ───────────────────────────────────────────────
        var attendanceDates = new[]
        {
            new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 2, 3, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 4, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 2, 8, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 11, 0, 0, 0, DateTimeKind.Utc)
        };

        var rng = new Random(42); // deterministic seed
        var statuses = new[] { AttendanceStatus.Present, AttendanceStatus.Present, AttendanceStatus.Present, AttendanceStatus.Present,
                               AttendanceStatus.Present, AttendanceStatus.Late, AttendanceStatus.Absent, AttendanceStatus.Excused };

        // Attendance for students in 9A (Ali, Layla) — Math by Ahmed
        foreach (var date in attendanceDates)
        {
            var submissionStatuses = new[] { SubmissionStatus.Submitted, SubmissionStatus.Submitted, SubmissionStatus.SubmittedLate };
            foreach (var sp in new[] { sp1, sp2 })
            {
                var status = statuses[rng.Next(statuses.Length)];
                var subStatus = submissionStatuses[rng.Next(submissionStatuses.Length)];
                db.AttendanceRecords.Add(new AttendanceRecord
                {
                    SchoolTenantId = school.Id,
                    StudentProfileId = sp.Id,
                    TeacherProfileId = tpAhmed.Id,
                    SubjectId = subMath.Id,
                    GroupId = grp9A.Id,
                    SemesterId = sem1.Id,
                    Date = date,
                    SessionTime = new TimeSpan(8, 0, 0),
                    Status = status,
                    SubmissionStatus = subStatus,
                    SubmittedAt = date.AddHours(8).AddMinutes(rng.Next(0, 30)),
                    Notes = status == AttendanceStatus.Absent ? "No excuse provided" : status == AttendanceStatus.Late ? "Arrived 10 min late" : null
                });
            }
        }

        // Attendance for Reem (10A) — Physics by Fatima
        foreach (var date in attendanceDates)
        {
            var status = statuses[rng.Next(statuses.Length)];
            db.AttendanceRecords.Add(new AttendanceRecord
            {
                SchoolTenantId = school.Id,
                StudentProfileId = sp4.Id,
                TeacherProfileId = tpFatima.Id,
                SubjectId = subPhysics.Id,
                GroupId = grp10A.Id,
                SemesterId = sem1.Id,
                Date = date,
                SessionTime = new TimeSpan(8, 0, 0),
                Status = status,
                SubmissionStatus = SubmissionStatus.Submitted,
                SubmittedAt = date.AddHours(8).AddMinutes(5),
                Notes = status == AttendanceStatus.Excused ? "Medical appointment" : null
            });
        }

        // Attendance for Hana (11A) — Chemistry by Fatima
        foreach (var date in attendanceDates)
        {
            db.AttendanceRecords.Add(new AttendanceRecord
            {
                SchoolTenantId = school.Id,
                StudentProfileId = sp6.Id,
                TeacherProfileId = tpFatima.Id,
                SubjectId = subChemistry.Id,
                GroupId = grp11A.Id,
                SemesterId = sem1.Id,
                Date = date,
                SessionTime = new TimeSpan(9, 0, 0),
                Status = AttendanceStatus.Present,
                SubmissionStatus = SubmissionStatus.Submitted,
                SubmittedAt = date.AddHours(9).AddMinutes(10)
            });
        }

        // ───────────────────────────────────────────────
        // 18. GRADE RECORDS
        // ───────────────────────────────────────────────
        void AddGradeRec(StudentProfile sp, TeacherProfile tp, Subject sub, string assessment, decimal score, decimal max, string letter, DateTime date, string? notes = null)
        {
            db.GradeRecords.Add(new GradeRecord
            {
                SchoolTenantId = school.Id,
                StudentProfileId = sp.Id,
                TeacherProfileId = tp.Id,
                SubjectId = sub.Id,
                SemesterId = sem1.Id,
                AssessmentType = assessment,
                Score = score,
                MaxScore = max,
                LetterGrade = letter,
                RecordedDate = date,
                Notes = notes
            });
        }

        // Ali — Math grades
        AddGradeRec(sp1, tpAhmed, subMath, "Quiz 1", 18, 20, "A", new DateTime(2025, 10, 5, 0, 0, 0, DateTimeKind.Utc), "Excellent work");
        AddGradeRec(sp1, tpAhmed, subMath, "Midterm", 42, 50, "A-", new DateTime(2025, 11, 15, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp1, tpAhmed, subMath, "Assignment 1", 9, 10, "A", new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc));
        // Ali — English grades (Noor)
        AddGradeRec(sp1, tpNoor, subEnglish, "Quiz 1", 15, 20, "B+", new DateTime(2025, 10, 8, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp1, tpNoor, subEnglish, "Midterm", 38, 50, "B", new DateTime(2025, 11, 18, 0, 0, 0, DateTimeKind.Utc));

        // Layla — Math grades
        AddGradeRec(sp2, tpAhmed, subMath, "Quiz 1", 20, 20, "A+", new DateTime(2025, 10, 5, 0, 0, 0, DateTimeKind.Utc), "Perfect score!");
        AddGradeRec(sp2, tpAhmed, subMath, "Midterm", 48, 50, "A+", new DateTime(2025, 11, 15, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp2, tpAhmed, subMath, "Assignment 1", 10, 10, "A+", new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc));

        // Reem — Physics grades (Fatima)
        AddGradeRec(sp4, tpFatima, subPhysics, "Quiz 1", 16, 20, "B+", new DateTime(2025, 10, 7, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp4, tpFatima, subPhysics, "Midterm", 35, 50, "B-", new DateTime(2025, 11, 20, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp4, tpFatima, subPhysics, "Lab Report 1", 22, 25, "A-", new DateTime(2025, 12, 5, 0, 0, 0, DateTimeKind.Utc));

        // Mohammed — Physics grades (Fatima, 10B)
        AddGradeRec(sp5, tpFatima, subPhysics, "Quiz 1", 12, 20, "C+", new DateTime(2025, 10, 7, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp5, tpFatima, subPhysics, "Midterm", 28, 50, "C", new DateTime(2025, 11, 20, 0, 0, 0, DateTimeKind.Utc), "Needs improvement");

        // Hana — Chemistry + CS grades
        AddGradeRec(sp6, tpFatima, subChemistry, "Quiz 1", 19, 20, "A", new DateTime(2025, 10, 10, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp6, tpFatima, subChemistry, "Midterm", 46, 50, "A", new DateTime(2025, 11, 22, 0, 0, 0, DateTimeKind.Utc), "Outstanding");
        AddGradeRec(sp6, tpNoor, subCS, "Project 1", 48, 50, "A+", new DateTime(2025, 12, 10, 0, 0, 0, DateTimeKind.Utc), "Innovative solution");
        AddGradeRec(sp6, tpNoor, subCS, "Midterm", 44, 50, "A", new DateTime(2025, 11, 25, 0, 0, 0, DateTimeKind.Utc));

        // Sami — Arabic grades (Omar)
        AddGradeRec(sp3, tpOmar, subArabic, "Quiz 1", 14, 20, "B", new DateTime(2025, 10, 6, 0, 0, 0, DateTimeKind.Utc));
        AddGradeRec(sp3, tpOmar, subArabic, "Midterm", 30, 50, "C+", new DateTime(2025, 11, 16, 0, 0, 0, DateTimeKind.Utc));

        // ───────────────────────────────────────────────
        // 19. BEHAVIOR FEEDBACK
        // ───────────────────────────────────────────────
        void AddBehavior(StudentProfile sp, TeacherProfile tp, string cat, int rating, string desc, DateTime date)
        {
            db.BehaviorFeedbacks.Add(new BehaviorFeedback
            {
                SchoolTenantId = school.Id,
                StudentProfileId = sp.Id,
                TeacherProfileId = tp.Id,
                SemesterId = sem1.Id,
                Category = cat,
                Rating = rating,
                Description = desc,
                RecordedDate = date
            });
        }

        AddBehavior(sp1, tpAhmed, "Behavior", 4, "Very well-behaved, helps classmates", new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp1, tpAhmed, "Participation", 5, "Always raises hand, engaged in class", new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp2, tpAhmed, "Behavior", 5, "Exemplary conduct, role model student", new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp2, tpAhmed, "Participation", 5, "Exceptional participation and curiosity", new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp3, tpOmar, "Behavior", 3, "Generally good, occasional disruptions", new DateTime(2025, 10, 18, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp3, tpOmar, "Participation", 2, "Rarely participates, needs encouragement", new DateTime(2025, 10, 18, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp4, tpFatima, "Behavior", 4, "Respectful and focused", new DateTime(2025, 10, 20, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp4, tpFatima, "Participation", 4, "Good engagement in lab activities", new DateTime(2025, 10, 20, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp5, tpFatima, "Behavior", 2, "Frequently distracted, talking in class", new DateTime(2025, 10, 20, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp5, tpFatima, "Participation", 2, "Minimal effort in group work", new DateTime(2025, 10, 20, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp6, tpFatima, "Behavior", 5, "Outstanding conduct at all times", new DateTime(2025, 10, 22, 0, 0, 0, DateTimeKind.Utc));
        AddBehavior(sp6, tpNoor, "Participation", 5, "Leads group discussions, mentors peers", new DateTime(2025, 10, 22, 0, 0, 0, DateTimeKind.Utc));

        // ───────────────────────────────────────────────
        // 20. WEEKLY REPORTS
        // ───────────────────────────────────────────────
        // Week 5 — Ahmed's Math report for Ali
        var wr1 = new WeeklyReport
        {
            SchoolTenantId = school.Id,
            StudentProfileId = sp1.Id,
            TeacherProfileId = tpAhmed.Id,
            SubjectId = subMath.Id,
            SemesterId = sem1.Id,
            WeekNumber = 5,
            WeekStartDate = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc),
            WeekEndDate = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc),
            Status = WeeklyReportStatus.Distributed,
            SubmittedAt = new DateTime(2026, 2, 6, 14, 0, 0, DateTimeKind.Utc),
            DistributedAt = new DateTime(2026, 2, 7, 8, 0, 0, DateTimeKind.Utc)
        };
        db.WeeklyReports.Add(wr1);
        db.WeeklyReportItems.AddRange(
            new WeeklyReportItem { WeeklyReportId = wr1.Id, AttributeName = "Academic Performance", NumericValue = 4, Comments = "Strong performance on quiz" },
            new WeeklyReportItem { WeeklyReportId = wr1.Id, AttributeName = "Homework", NumericValue = 5, Comments = "All homework submitted on time" },
            new WeeklyReportItem { WeeklyReportId = wr1.Id, AttributeName = "Behavior", NumericValue = 4, Comments = "Good behavior throughout the week" },
            new WeeklyReportItem { WeeklyReportId = wr1.Id, AttributeName = "Participation", NumericValue = 5, Comments = "Actively participated in group work" },
            new WeeklyReportItem { WeeklyReportId = wr1.Id, AttributeName = "Notes", Value = "Ali is making great progress. Recommend advanced exercises." }
        );

        // Week 5 — Ahmed's Math report for Layla
        var wr2 = new WeeklyReport
        {
            SchoolTenantId = school.Id,
            StudentProfileId = sp2.Id,
            TeacherProfileId = tpAhmed.Id,
            SubjectId = subMath.Id,
            SemesterId = sem1.Id,
            WeekNumber = 5,
            WeekStartDate = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc),
            WeekEndDate = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc),
            Status = WeeklyReportStatus.Submitted,
            SubmittedAt = new DateTime(2026, 2, 6, 15, 0, 0, DateTimeKind.Utc)
        };
        db.WeeklyReports.Add(wr2);
        db.WeeklyReportItems.AddRange(
            new WeeklyReportItem { WeeklyReportId = wr2.Id, AttributeName = "Academic Performance", NumericValue = 5, Comments = "Top of the class" },
            new WeeklyReportItem { WeeklyReportId = wr2.Id, AttributeName = "Homework", NumericValue = 5, Comments = "Perfect streak" },
            new WeeklyReportItem { WeeklyReportId = wr2.Id, AttributeName = "Behavior", NumericValue = 5, Comments = "Perfect conduct" },
            new WeeklyReportItem { WeeklyReportId = wr2.Id, AttributeName = "Notes", Value = "Layla continues to excel. She is ready for math olympiad prep." }
        );

        // Week 5 — Fatima's Physics report for Reem (draft)
        var wr3 = new WeeklyReport
        {
            SchoolTenantId = school.Id,
            StudentProfileId = sp4.Id,
            TeacherProfileId = tpFatima.Id,
            SubjectId = subPhysics.Id,
            SemesterId = sem1.Id,
            WeekNumber = 5,
            WeekStartDate = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc),
            WeekEndDate = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc),
            Status = WeeklyReportStatus.Draft
        };
        db.WeeklyReports.Add(wr3);
        db.WeeklyReportItems.AddRange(
            new WeeklyReportItem { WeeklyReportId = wr3.Id, AttributeName = "Academic Performance", NumericValue = 3, Comments = "Average - needs to review lab concepts" },
            new WeeklyReportItem { WeeklyReportId = wr3.Id, AttributeName = "Participation", NumericValue = 4, Comments = "Good engagement in experiments" },
            new WeeklyReportItem { WeeklyReportId = wr3.Id, AttributeName = "Behavior", NumericValue = 4, Comments = "Well-behaved" }
        );

        // Week 4 — Omar's Arabic report for Sami (distributed)
        var wr4 = new WeeklyReport
        {
            SchoolTenantId = school.Id,
            StudentProfileId = sp3.Id,
            TeacherProfileId = tpOmar.Id,
            SubjectId = subArabic.Id,
            SemesterId = sem1.Id,
            WeekNumber = 4,
            WeekStartDate = new DateTime(2026, 1, 26, 0, 0, 0, DateTimeKind.Utc),
            WeekEndDate = new DateTime(2026, 1, 30, 0, 0, 0, DateTimeKind.Utc),
            Status = WeeklyReportStatus.Distributed,
            SubmittedAt = new DateTime(2026, 1, 30, 14, 0, 0, DateTimeKind.Utc),
            DistributedAt = new DateTime(2026, 1, 31, 8, 0, 0, DateTimeKind.Utc)
        };
        db.WeeklyReports.Add(wr4);
        db.WeeklyReportItems.AddRange(
            new WeeklyReportItem { WeeklyReportId = wr4.Id, AttributeName = "Academic Performance", NumericValue = 2, Comments = "Struggling with grammar" },
            new WeeklyReportItem { WeeklyReportId = wr4.Id, AttributeName = "Homework", NumericValue = 1, Comments = "2 of 3 assignments missing" },
            new WeeklyReportItem { WeeklyReportId = wr4.Id, AttributeName = "Behavior", NumericValue = 3, Comments = "Acceptable but needs focus" },
            new WeeklyReportItem { WeeklyReportId = wr4.Id, AttributeName = "Notes", Value = "Sami needs additional support in writing. Recommend tutoring sessions." }
        );

        // ───────────────────────────────────────────────
        // 21. INTERNAL REPORTS
        // ───────────────────────────────────────────────
        // Report 1: Omar flags Sami for academic concern
        var ir1 = new InternalReport
        {
            SchoolTenantId = school.Id,
            ReporterTeacherProfileId = tpOmar.Id,
            StudentProfileId = sp3.Id,
            AssignedSupervisorId = tpSupervisor.Id,
            Category = InternalReportCategory.AcademicConcern,
            Status = InternalReportStatus.UnderReview,
            Title = "Sami Al-Zahrani — Declining Arabic Performance",
            Description = "Sami has been consistently underperforming in Arabic class. Missing homework assignments and quiz scores are declining. He seems disengaged and may need academic support intervention."
        };
        db.InternalReports.Add(ir1);
        db.InternalReportComments.AddRange(
            new InternalReportComment { InternalReportId = ir1.Id, AuthorUserId = teacherOmar.Id, Content = "Filed this report after Week 4 results. Sami scored 60% on the midterm.", IsDecisionNote = false },
            new InternalReportComment { InternalReportId = ir1.Id, AuthorUserId = supervisorUser.Id, Content = "Reviewing. Will schedule a meeting with the student and parent.", IsDecisionNote = true }
        );

        // Report 2: Fatima flags Mohammed for behavior
        var ir2 = new InternalReport
        {
            SchoolTenantId = school.Id,
            ReporterTeacherProfileId = tpFatima.Id,
            StudentProfileId = sp5.Id,
            Category = InternalReportCategory.Behavior,
            Status = InternalReportStatus.Submitted,
            Title = "Mohammed Ibrahim — Disruptive Behavior in Physics Lab",
            Description = "Mohammed has been disruptive during lab sessions on multiple occasions. He talks during instructions, doesn't follow safety protocols, and distracts other students."
        };
        db.InternalReports.Add(ir2);
        db.InternalReportComments.Add(
            new InternalReportComment { InternalReportId = ir2.Id, AuthorUserId = teacherFatima.Id, Content = "This is the third incident this month. Previous verbal warnings were ineffective.", IsDecisionNote = false }
        );

        // Report 3: Resolved operational issue
        var ir3 = new InternalReport
        {
            SchoolTenantId = school.Id,
            ReporterTeacherProfileId = tpNoor.Id,
            Category = InternalReportCategory.OperationalIssue,
            Status = InternalReportStatus.Resolved,
            Title = "IT Lab Projector Malfunction",
            Description = "The projector in the IT Lab (Room IT-1) has been malfunctioning intermittently. Cannot display properly during CS lessons.",
            ResolvedAt = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc)
        };
        db.InternalReports.Add(ir3);
        db.InternalReportComments.AddRange(
            new InternalReportComment { InternalReportId = ir3.Id, AuthorUserId = teacherNoor.Id, Content = "Projector flickering and sometimes showing blue screen.", IsDecisionNote = false },
            new InternalReportComment { InternalReportId = ir3.Id, AuthorUserId = manager.Id, Content = "Maintenance team replaced the projector bulb. Issue resolved.", IsDecisionNote = true }
        );

        // Report 4: Escalated student risk
        var ir4 = new InternalReport
        {
            SchoolTenantId = school.Id,
            ReporterTeacherProfileId = tpAhmed.Id,
            StudentProfileId = sp5.Id,
            AssignedSupervisorId = tpSupervisor.Id,
            Category = InternalReportCategory.StudentRisk,
            Status = InternalReportStatus.Escalated,
            Title = "Mohammed Ibrahim — At Risk of Failing Multiple Subjects",
            Description = "Mohammed's overall performance in Math and Physics indicates he is at risk of failing this term. Combined with behavioral issues, this needs management intervention.",
            EscalatedToUserId = manager.Id,
            EscalatedAt = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc)
        };
        db.InternalReports.Add(ir4);
        db.InternalReportComments.AddRange(
            new InternalReportComment { InternalReportId = ir4.Id, AuthorUserId = teacherAhmed.Id, Content = "Math midterm: 56%. Homework completion rate below 50%.", IsDecisionNote = false },
            new InternalReportComment { InternalReportId = ir4.Id, AuthorUserId = supervisorUser.Id, Content = "Escalating to school management. This requires a parent-teacher conference.", IsDecisionNote = true },
            new InternalReportComment { InternalReportId = ir4.Id, AuthorUserId = manager.Id, Content = "Acknowledged. Scheduling parent meeting for next week.", IsDecisionNote = true }
        );

        // ───────────────────────────────────────────────
        // 22. NOTIFICATION EVENTS
        // ───────────────────────────────────────────────
        db.NotificationEvents.AddRange(
            new NotificationEvent
            {
                SchoolTenantId = school.Id,
                EventType = "WeeklyReportDelivered",
                Channel = NotificationChannel.InApp,
                RecipientUserId = parent1User.Id,
                Subject = "Weekly Report Available",
                Body = "Ali's Math weekly report for Week 5 is now available.",
                DeliveryStatus = NotificationDeliveryStatus.Delivered,
                SentAt = new DateTime(2026, 2, 7, 8, 0, 0, DateTimeKind.Utc),
                DeliveredAt = new DateTime(2026, 2, 7, 8, 1, 0, DateTimeKind.Utc),
                RelatedEntityId = wr1.Id,
                RelatedEntityType = "WeeklyReport"
            },
            new NotificationEvent
            {
                SchoolTenantId = school.Id,
                EventType = "WeeklyReportDelivered",
                Channel = NotificationChannel.InApp,
                RecipientUserId = parent2User.Id,
                Subject = "Weekly Report Available",
                Body = "Layla's Math weekly report for Week 5 has been submitted.",
                DeliveryStatus = NotificationDeliveryStatus.Sent,
                SentAt = new DateTime(2026, 2, 7, 8, 5, 0, DateTimeKind.Utc),
                RelatedEntityId = wr2.Id,
                RelatedEntityType = "WeeklyReport"
            },
            new NotificationEvent
            {
                SchoolTenantId = school.Id,
                EventType = "AttendanceMissing",
                Channel = NotificationChannel.InApp,
                RecipientUserId = parent3User.Id,
                Subject = "Attendance Alert",
                Body = "Sami was marked absent on Feb 3, 2026 in Arabic class.",
                DeliveryStatus = NotificationDeliveryStatus.Delivered,
                SentAt = new DateTime(2026, 2, 3, 12, 0, 0, DateTimeKind.Utc),
                DeliveredAt = new DateTime(2026, 2, 3, 12, 1, 0, DateTimeKind.Utc)
            },
            new NotificationEvent
            {
                SchoolTenantId = school.Id,
                EventType = "EscalationUpdate",
                Channel = NotificationChannel.InApp,
                RecipientUserId = manager.Id,
                Subject = "Internal Report Escalated",
                Body = "An internal report about Mohammed Ibrahim has been escalated to you for review.",
                DeliveryStatus = NotificationDeliveryStatus.Delivered,
                SentAt = new DateTime(2026, 2, 10, 9, 0, 0, DateTimeKind.Utc),
                DeliveredAt = new DateTime(2026, 2, 10, 9, 1, 0, DateTimeKind.Utc),
                RelatedEntityId = ir4.Id,
                RelatedEntityType = "InternalReport"
            },
            new NotificationEvent
            {
                SchoolTenantId = school.Id,
                EventType = "WeeklyReportDelivered",
                Channel = NotificationChannel.Email,
                RecipientUserId = parent3User.Id,
                Subject = "Weekly Report: Sami — Arabic Week 4",
                Body = "Dear Mr. Khaled,\n\nThis is to inform you that Sami's Arabic weekly report for Week 4 is now available. Please review.",
                DeliveryStatus = NotificationDeliveryStatus.Failed,
                SentAt = new DateTime(2026, 2, 1, 8, 0, 0, DateTimeKind.Utc),
                FailureReason = "SMTP connection timeout",
                RelatedEntityId = wr4.Id,
                RelatedEntityType = "WeeklyReport"
            }
        );

        // ───────────────────────────────────────────────
        // 23. AUDIT LOGS
        // ───────────────────────────────────────────────
        db.AuditLogs.AddRange(
            new AuditLog { SchoolTenantId = school.Id, Action = AuditAction.Login, EntityType = "ApplicationUser", EntityId = schoolAdmin.Id.ToString(), UserId = schoolAdmin.Id, UserEmail = schoolAdmin.Email, UserRole = "SchoolAdmin", Description = "School admin logged in" },
            new AuditLog { SchoolTenantId = school.Id, Action = AuditAction.Create, EntityType = "TeacherSubjectLink", UserId = schoolAdmin.Id, UserEmail = schoolAdmin.Email, UserRole = "SchoolAdmin", Description = "Created teacher subject links for Term 1" },
            new AuditLog { SchoolTenantId = school.Id, Action = AuditAction.TimetablePublish, EntityType = "TimetableVersion", EntityId = tt9A.Id.ToString(), UserId = schoolAdmin.Id, UserEmail = schoolAdmin.Email, UserRole = "SchoolAdmin", Description = "Published Term 1 timetable" },
            new AuditLog { SchoolTenantId = school.Id, Action = AuditAction.ReportSubmission, EntityType = "WeeklyReport", EntityId = wr1.Id.ToString(), UserId = teacherAhmed.Id, UserEmail = teacherAhmed.Email, UserRole = "Teacher", Description = "Weekly report submitted for Ali — Math Week 5" },
            new AuditLog { SchoolTenantId = school.Id, Action = AuditAction.InternalReportAction, EntityType = "InternalReport", EntityId = ir4.Id.ToString(), UserId = supervisorUser.Id, UserEmail = supervisorUser.Email, UserRole = "TeacherSupervisor", Description = "Escalated report about Mohammed to management" },
            new AuditLog { SchoolTenantId = school.Id, Action = AuditAction.FeatureFlagChange, EntityType = "FeatureFlag", UserId = schoolAdmin.Id, UserEmail = schoolAdmin.Email, UserRole = "SchoolAdmin", Description = "Enabled WhatsApp notifications feature" }
        );

        // ───────────────────────────────────────────────
        // SAVE ALL
        // ───────────────────────────────────────────────
        db.SaveChanges();
    }
}
