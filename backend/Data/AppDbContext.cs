using Microsoft.EntityFrameworkCore;

namespace ManyVagas.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<BaseResume> BaseResumes => Set<BaseResume>();
    public DbSet<GeneratedResume> GeneratedResumes => Set<GeneratedResume>();
}
