using Microsoft.EntityFrameworkCore;
using ScoutingApi.Data;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// EF Core - PostgreSQL
builder.Services.AddDbContext<ScoutingDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Controllers
builder.Services.AddControllers(options =>
    {
        // Evita que propriedades de referência não anuláveis virem [Required] implicitamente
        options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
    })
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply EF Core migrations automatically on startup (dev-friendly)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

    // Admin-only (DEV) endpoints to manage seed/cleanup without requiring psql locally
    app.MapPost("/admin/cleanup-all", async (IServiceProvider sp) =>
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Seeds", "cleanup_all_data.sql");
        if (!System.IO.File.Exists(sqlPath)) return Results.NotFound(new { message = "cleanup_all_data.sql not found" });
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await db.Database.ExecuteSqlRawAsync(sql);
        return Results.Ok(new { status = "ok", ran = "cleanup_all_data.sql" });
    });

    app.MapPost("/admin/seed-core", async (IServiceProvider sp) =>
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Seeds", "seed_core_data.sql");
        if (!System.IO.File.Exists(sqlPath)) return Results.NotFound(new { message = "seed_core_data.sql not found" });
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await db.Database.ExecuteSqlRawAsync(sql);
        return Results.Ok(new { status = "ok", ran = "seed_core_data.sql" });
    });

    app.MapPost("/admin/seed-evals", async (IServiceProvider sp) =>
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Seeds", "sample_evaluations.sql");
        if (!System.IO.File.Exists(sqlPath)) return Results.NotFound(new { message = "sample_evaluations.sql not found" });
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await db.Database.ExecuteSqlRawAsync(sql);
        return Results.Ok(new { status = "ok", ran = "sample_evaluations.sql" });
    });

    app.MapPost("/admin/seed-eval-details", async (IServiceProvider sp) =>
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Seeds", "seed_evaluation_details.sql");
        if (!System.IO.File.Exists(sqlPath)) return Results.NotFound(new { message = "seed_evaluation_details.sql not found" });
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await db.Database.ExecuteSqlRawAsync(sql);
        return Results.Ok(new { status = "ok", ran = "seed_evaluation_details.sql" });
    });

    app.MapPost("/admin/fix-ages", async (IServiceProvider sp) =>
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Seeds", "fix_player_ages.sql");
        if (!System.IO.File.Exists(sqlPath)) return Results.NotFound(new { message = "fix_player_ages.sql not found" });
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await db.Database.ExecuteSqlRawAsync(sql);
        return Results.Ok(new { status = "ok", ran = "fix_player_ages.sql" });
    });

    app.MapPost("/admin/fix-positions", async (IServiceProvider sp) =>
    {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ScoutingDbContext>();
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Seeds", "fix_player_positions.sql");
        if (!System.IO.File.Exists(sqlPath)) return Results.NotFound(new { message = "fix_player_positions.sql not found" });
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await db.Database.ExecuteSqlRawAsync(sql);
        return Results.Ok(new { status = "ok", ran = "fix_player_positions.sql" });
    });
}

// app.UseHttpsRedirection();
app.UseStaticFiles(); // serve arquivos em wwwroot (uploads de vídeos, etc.)

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();
