using SkillSphere.Domain.Interfaces;
using SkillSphere.Infrastructure.Persistence;

namespace SkillSphere.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly SkillSphereDbContext _context;

    public UnitOfWork(SkillSphereDbContext context) => _context = context;

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);

    public void Dispose() => _context.Dispose();
}
