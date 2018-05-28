using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AuroraGame.Controllers
{
    public class HelpController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Aurora Game - Instruções";

            return View();
        }
    }
}