namespace MyProject.Dto
{
    public class Response
    {
        public int statusCode { get; set; }
        public String message { get; set; } = string.Empty;
        public String token { get; set; } = string.Empty;
        public String role { get; set; } = string.Empty;
        public String expirationTime { get; set; } = string.Empty;

    }
}
