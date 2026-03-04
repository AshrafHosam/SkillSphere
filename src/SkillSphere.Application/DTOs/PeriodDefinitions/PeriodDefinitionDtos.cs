namespace SkillSphere.Application.DTOs.PeriodDefinitions;

public class PeriodDefinitionDto
{
    public Guid Id { get; set; }
    public int PeriodNumber { get; set; }
    public string Label { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsBreak { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePeriodDefinitionRequest
{
    public int PeriodNumber { get; set; }
    public string Label { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsBreak { get; set; }
}
