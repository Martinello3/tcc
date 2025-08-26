using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class HistoricoClubesController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, HistoricoClube>(db)
{
}

