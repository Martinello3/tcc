using Microsoft.AspNetCore.Mvc;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class ClubesController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Clube>(db)
{
}

