using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class CrudBase<TContext, TEntity> : ControllerBase
    where TContext : DbContext
    where TEntity : class
{
    protected readonly TContext _db;
    protected readonly DbSet<TEntity> _set;

    protected CrudBase(TContext db)
    {
        _db = db;
        _set = _db.Set<TEntity>();
    }

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TEntity>>> GetAll()
        => Ok(await _set.AsNoTracking().ToListAsync());

    [HttpGet("{id:int}")]
    public virtual async Task<ActionResult<TEntity>> GetById(int id)
    {
        var entity = await _set.FindAsync(id);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    public virtual async Task<ActionResult<TEntity>> Create(TEntity entity)
    {
        _set.Add(entity);
        await _db.SaveChangesAsync();
        var idProp = entity!.GetType().GetProperty("Id")!;
        var id = idProp.GetValue(entity);
        return CreatedAtAction(nameof(GetById), new { id }, entity);
    }

    [HttpPut("{id:int}")]
    public virtual async Task<IActionResult> Update(int id, TEntity entity)
    {
        var idProp = entity!.GetType().GetProperty("Id")!;
        idProp.SetValue(entity, id);
        _db.Entry(entity).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public virtual async Task<IActionResult> Delete(int id)
    {
        var entity = await _set.FindAsync(id);
        if (entity is null) return NotFound();
        _set.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

