namespace SkillSphere.Application.DTOs.Assignments;

public class StudentAssignmentDto
{
    public Guid Id { get; set; }
    public Guid StudentProfileId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid GradeId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateStudentAssignmentRequest
{
    public Guid StudentProfileId { get; set; }
    public Guid GradeId { get; set; }
    public Guid GroupId { get; set; }
    public Guid SemesterId { get; set; }
}
