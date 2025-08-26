using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class AvaliacoesController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Avaliacao>(db)
{
}

