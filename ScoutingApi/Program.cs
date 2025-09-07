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
}

// app.UseHttpsRedirection();
app.UseStaticFiles(); // serve arquivos em wwwroot (uploads de vídeos, etc.)

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();
