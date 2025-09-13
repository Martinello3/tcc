using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;

namespace ScoutingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly ScoutingDbContext _db;
    public UploadsController(ScoutingDbContext db) { _db = db; }

    private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".png", ".jpg", ".jpeg", ".gif", ".webp"
    };

    private async Task<(bool ok, string? relPath, string? error)> SaveFileAsync(IFormFile file, string subfolder)
    {
        if (file == null || file.Length == 0)
            return (false, null, "Arquivo não enviado");

        var ext = Path.GetExtension(file.FileName);
        if (!AllowedImageExtensions.Contains(ext))
            return (false, null, "Extensão de imagem não suportada");

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "fotos", subfolder);
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var destPath = Path.Combine(uploadsDir, fileName);
        await using (var stream = System.IO.File.Create(destPath))
        {
            await file.CopyToAsync(stream);
        }
        var publicPath = $"/uploads/fotos/{subfolder}/{fileName}";
        return (true, publicPath, null);
    }

    [HttpPost("jogadores/foto")]
    [RequestSizeLimit(1024L * 1024 * 10)] // 10MB
    public async Task<ActionResult> UploadJogadorFoto([FromForm] IFormFile file)
    {
        var (ok, path, error) = await SaveFileAsync(file, "jogadores");
        if (!ok) return BadRequest(new { message = error });
        return Ok(new { path });
    }

    [HttpPost("usuarios/foto")]
    [RequestSizeLimit(1024L * 1024 * 10)] // 10MB
    public async Task<ActionResult> UploadUsuarioFoto([FromForm] IFormFile file)
    {
        var (ok, path, error) = await SaveFileAsync(file, "usuarios");
        if (!ok) return BadRequest(new { message = error });
        return Ok(new { path });
    }

    [HttpPost("clubes/foto")]
    [RequestSizeLimit(1024L * 1024 * 10)] // 10MB
    public async Task<ActionResult> UploadClubeFoto([FromForm] IFormFile file)
    {
        var (ok, path, error) = await SaveFileAsync(file, "clubes");
        if (!ok) return BadRequest(new { message = error });
        return Ok(new { path });
    }

    [HttpPost("cleanup")]
    public async Task<ActionResult> Cleanup()
    {
        // Coleta todos os caminhos referenciados no banco
        var refs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        static string Normalize(string p)
        {
            if (string.IsNullOrWhiteSpace(p)) return string.Empty;
            var s = p.Replace('\\', '/');
            if (!s.StartsWith('/')) s = "/" + s;
            return s;
        }
        void AddMany(IEnumerable<string?> items)
        {
            foreach (var x in items)
                if (!string.IsNullOrWhiteSpace(x)) refs.Add(Normalize(x!));
        }
        AddMany(await _db.Jogadores.AsNoTracking().Select(j => j.Foto).ToListAsync());
        AddMany(await _db.Usuarios.AsNoTracking().Select(u => u.Foto).ToListAsync());
        AddMany(await _db.Clubes.AsNoTracking().Select(c => c.Foto).ToListAsync());

        // Percorre as pastas e remove arquivos não referenciados
        var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "fotos");
        var subfolders = new[] { "jogadores", "usuarios", "clubes" };
        int deleted = 0, kept = 0, total = 0;
        var deletedFiles = new List<string>();

        foreach (var sub in subfolders)
        {
            var dir = Path.Combine(root, sub);
            if (!Directory.Exists(dir)) continue;
            foreach (var file in Directory.GetFiles(dir))
            {
                total++;
                var fileName = Path.GetFileName(file);
                var webPath = $"/uploads/fotos/{sub}/{fileName}";
                if (!refs.Contains(Normalize(webPath)))
                {
                    try { System.IO.File.Delete(file); deleted++; deletedFiles.Add(webPath); }
                    catch { kept++; }
                }
                else kept++;
            }
        }
        return Ok(new { total, deleted, kept, deletedFiles });
    }
}

