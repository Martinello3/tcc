using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class VideosController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Video>(db)
{
}

