using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class LesoesController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Lesao>(db)
{
}

