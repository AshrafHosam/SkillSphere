namespace SkillSphere.Application.DTOs.TeacherSubjectLinks;

public class TeacherSubjectLinkDto
{
    public Guid Id { get; set; }
    public Guid TeacherProfileId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid? GradeId { get; set; }
    public string? GradeName { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTeacherSubjectLinkRequest
{
    public Guid TeacherProfileId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid? GradeId { get; set; }
}
