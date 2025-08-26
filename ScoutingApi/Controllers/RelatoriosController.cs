using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class RelatoriosController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Relatorio>(db)
{
}

