using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class UsuariosController : CrudBase<ScoutingDbContext, Usuario>
{
    private new readonly ScoutingDbContext _db;
    public UsuariosController(ScoutingDbContext db) : base(db) { _db = db; }

    private static string? ToAbsolutePathIfLocal(string? maybeRelative)
    {
        if (string.IsNullOrWhiteSpace(maybeRelative)) return null;
        var p = maybeRelative!.Trim();
        if (p.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || p.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return null;
        if (p.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
        {
            var rel = p.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", rel);
        }
        if (p.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
        {
            var rel = p.Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", rel);
        }
        return null;
    }
    private static void TryDeleteLocalFile(string? oldPath)
    {
        try
        {
            var abs = ToAbsolutePathIfLocal(oldPath);
            if (abs != null && System.IO.File.Exists(abs)) System.IO.File.Delete(abs);
        }
        catch { }
    }

    [HttpPut("{id:int}")]
    public override async Task<IActionResult> Update(int id, Usuario entity)
    {
        var current = await _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        var oldFoto = current?.Foto;
        var result = await base.Update(id, entity);
        if (result is NoContentResult && !string.IsNullOrWhiteSpace(oldFoto) && !string.Equals(oldFoto, entity.Foto, StringComparison.OrdinalIgnoreCase))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return result;
    }

    [HttpDelete("{id:int}")]
    public override async Task<IActionResult> Delete(int id)
    {
        var current = await _db.Usuarios.FindAsync(id);
        if (current is null) return NotFound();
        var oldFoto = current.Foto;
        var result = await base.Delete(id);
        if (result is NoContentResult && !string.IsNullOrWhiteSpace(oldFoto))
        {
            TryDeleteLocalFile(oldFoto);
        }
        return result;
    }


    [HttpPost]
    public override async Task<ActionResult<Usuario>> Create(Usuario entity)
    {
        var nome = (entity.Nome ?? string.Empty).Trim();
        var email = (entity.Email ?? string.Empty).Trim();
        var senha = entity.Senha ?? string.Empty;
        var perfil = string.IsNullOrWhiteSpace(entity.Perfil) ? "O" : entity.Perfil!.Trim();

        if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(senha))
            return BadRequest(new { message = "Nome, e-mail e senha são obrigatórios." });

        var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
        if (!emailAttr.IsValid(email))
            return BadRequest(new { message = "E-mail inválido." });

        var exists = await _db.Usuarios.AsNoTracking().AnyAsync(u => u.Email.ToLower() == email.ToLower());
        if (exists) return Conflict(new { message = "Já existe um usuário com este e-mail." });

        entity.Nome = nome;
        entity.Email = email;
        entity.Senha = senha;
        entity.Perfil = perfil;

        _db.Usuarios.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    public class UpdateMeuPerfilDto
    {
        public string? Nome { get; set; }
        public string? Foto { get; set; }
    }

    public class DeleteContaDto
    {
        public string Senha { get; set; } = string.Empty;
        public int? UserId { get; set; } // fallback se necessário
    }

    [HttpPut("meu-perfil")]
    public async Task<IActionResult> UpdateMeuPerfil([FromBody] UpdateMeuPerfilDto dto, [FromQuery] int? userId)
    {
        if (userId is null || userId <= 0) return BadRequest(new { message = "userId é obrigatório" });
        var u = await _db.Usuarios.FindAsync(userId.Value);
        if (u is null) return NotFound();
        if (!string.IsNullOrWhiteSpace(dto.Nome)) u.Nome = dto.Nome!.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Foto)) u.Foto = dto.Foto!.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("meu-perfil/avatar")]
    [RequestSizeLimit(1024L * 1024 * 10)] // 10MB
    public async Task<IActionResult> UploadMeuAvatar([FromForm] IFormFile file, [FromQuery] int? userId)
    {
        if (userId is null || userId <= 0) return BadRequest(new { message = "userId é obrigatório" });
        var u = await _db.Usuarios.FindAsync(userId.Value);
        if (u is null) return NotFound();
        if (file == null || file.Length == 0) return BadRequest(new { message = "Arquivo não enviado" });
        var ext = Path.GetExtension(file.FileName);
        var okExt = new[] { ".png", ".jpg", ".jpeg", ".gif", ".webp" };
        if (!okExt.Contains(ext, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { message = "Extensão de imagem não suportada" });
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "fotos", "usuarios");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var destPath = Path.Combine(uploadsDir, fileName);
        await using (var stream = System.IO.File.Create(destPath))
        {
            await file.CopyToAsync(stream);
        }
        var publicPath = $"/uploads/fotos/usuarios/{fileName}";

        var oldFoto = u.Foto;
        u.Foto = publicPath;
        await _db.SaveChangesAsync();
        TryDeleteLocalFile(oldFoto);
        return Ok(new { path = publicPath });
    }

    [HttpDelete("minha-conta")]
    public async Task<IActionResult> DeleteMinhaConta([FromBody] DeleteContaDto dto, [FromQuery] int? userId)
    {
        var uid = userId ?? dto.UserId;
        if (uid is null || uid <= 0) return BadRequest(new { message = "userId é obrigatório" });
        if (string.IsNullOrWhiteSpace(dto.Senha)) return BadRequest(new { message = "Senha é obrigatória" });
        var u = await _db.Usuarios.FindAsync(uid.Value);
        if (u is null) return NotFound();
        if (!string.Equals(u.Senha, dto.Senha, StringComparison.Ordinal))
            return Unauthorized(new { message = "Senha incorreta" });
        var oldFoto = u.Foto;
        _db.Usuarios.Remove(u);
        await _db.SaveChangesAsync();
        TryDeleteLocalFile(oldFoto);
        return NoContent();
    }
}

