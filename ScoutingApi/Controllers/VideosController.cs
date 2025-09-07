using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class VideosController : CrudBase<ScoutingDbContext, Video>
{
    private readonly ScoutingDbContext _db;
    public VideosController(ScoutingDbContext db) : base(db) { _db = db; }
    [HttpPost]
    public override async Task<ActionResult<Video>> Create(Video entity)
    {
        if (entity.DataEnvio.HasValue && entity.DataEnvio.Value.Kind == DateTimeKind.Unspecified)
            entity.DataEnvio = DateTime.SpecifyKind(entity.DataEnvio.Value, DateTimeKind.Utc);
        return await base.Create(entity);
    }

    [HttpPut("{id:int}")]
    public override async Task<IActionResult> Update(int id, Video entity)
    {
        if (entity.DataEnvio.HasValue && entity.DataEnvio.Value.Kind == DateTimeKind.Unspecified)
            entity.DataEnvio = DateTime.SpecifyKind(entity.DataEnvio.Value, DateTimeKind.Utc);
        return await base.Update(id, entity);
    }

    [HttpPost("upload")]
    [RequestSizeLimit(1024L * 1024 * 200)] // 200MB
    public async Task<ActionResult> Upload([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Arquivo não enviado");
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var destPath = Path.Combine(uploadsDir, fileName);
        await using (var stream = System.IO.File.Create(destPath))
        {
            await file.CopyToAsync(stream);
        }
        var publicPath = $"/uploads/videos/{fileName}";
        return Ok(new { path = publicPath });
    }

    [HttpGet("por-jogador/{jogadorId:int}")]
    public async Task<ActionResult<IEnumerable<Video>>> GetByJogador(int jogadorId)
    {
        var list = await _db.Videos.AsNoTracking().Where(v => v.JogadorId == jogadorId).ToListAsync();
        return Ok(list);
    }




}
