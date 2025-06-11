using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyProject.Entity.Enum;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        [HttpGet("StatusAttendance")]
        public IActionResult GetAllStatusAttendance()
        {
            var statuses = Enum.GetValues(typeof(StatusAttendance))
                .Cast<StatusAttendance>()
                .Select(s => new
                {
                    Id = (int)s,
                    Name = s.ToString()
                }).ToList();

            return Ok(statuses);
        }

        [HttpGet("StatusTask")]
        public IActionResult GetAllStatusTask()
        {
            var statuses = Enum.GetValues(typeof(StatusTask))
                .Cast<StatusTask>()
                .Select(s => new
                {
                    Id = (int)s,
                    Name = s.ToString()
                }).ToList();

            return Ok(statuses);
        }


    }
}
