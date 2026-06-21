using System.ComponentModel.DataAnnotations;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.DTOs.Rooms;

public class RoomDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public RoomType RoomType { get; set; }
    public int Capacity { get; set; }
    public string? Building { get; set; }
    public int? Floor { get; set; }
    public bool IsActive { get; set; }
}

public class CreateRoomRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    [Required]
    public RoomType RoomType { get; set; }
    [Range(1, 1000)]
    public int Capacity { get; set; }
    [MaxLength(100)]
    public string? Building { get; set; }
    public int? Floor { get; set; }
}

public class UpdateRoomRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(100)]
    public string NameAr { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;
    [Required]
    public RoomType RoomType { get; set; }
    [Range(1, 1000)]
    public int Capacity { get; set; }
    [MaxLength(100)]
    public string? Building { get; set; }
    public int? Floor { get; set; }
}
