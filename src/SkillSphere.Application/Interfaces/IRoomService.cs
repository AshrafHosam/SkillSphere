using SkillSphere.Application.Common;
using SkillSphere.Application.DTOs.Rooms;
using SkillSphere.Domain.Enums;

namespace SkillSphere.Application.Interfaces;

public interface IRoomService
{
    Task<Result<List<RoomDto>>> GetRoomsAsync(Guid tenantId, RoomType? type = null, CancellationToken ct = default);
    Task<Result<RoomDto>> CreateAsync(Guid tenantId, CreateRoomRequest request, CancellationToken ct = default);
    Task<Result<RoomDto>> UpdateAsync(Guid id, UpdateRoomRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
