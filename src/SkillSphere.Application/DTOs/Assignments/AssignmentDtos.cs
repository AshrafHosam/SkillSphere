namespace SkillSphere.Application.DTOs.Assignments;

public class StudentAssignmentDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public Guid ClassSectionId { get; set; }
    public string ClassSectionName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateStudentAssignmentRequest
{
    public Guid StudentProfileId { get; set; }
    public Guid GradeId { get; set; }
    public Guid ClassSectionId { get; set; }
    public Guid SemesterId { get; set; }
}

public class TeacherAssignmentDto
{
    public Guid Id { get; set; }
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid ClassSectionId { get; set; }
    public string ClassSectionName { get; set; } = string.Empty;
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateTeacherAssignmentRequest
{
    public Guid TeacherProfileId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid ClassSectionId { get; set; }
    public Guid GradeId { get; set; }
    public Guid SemesterId { get; set; }
}
