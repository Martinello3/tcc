using Microsoft.AspNetCore.Mvc;
using ScoutingApi.Data;
using ScoutingApi.Models;

namespace ScoutingApi.Controllers;

public class UsuariosController(ScoutingDbContext db) : CrudBase<ScoutingDbContext, Usuario>(db)
{
}

