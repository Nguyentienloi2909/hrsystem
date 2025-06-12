using CloudinaryDotNet;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyProject.Hubs;
using MyProject.Service;
using MyProject.Service.impl;
using MyProject.Service.interfac;
using MyProject.Utils;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
DotNetEnv.Env.Load();
var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");



// Add services to the container.
builder.Services.AddSignalR();

builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<IGroupChatService, GroupChatService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IStatusNotificationService, StatusNotificationService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISalaryService, SalaryService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<JwtService, JwtService>();

builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
// config token
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
            ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret!))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ADMIN", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("LEADER", policy => policy.RequireRole("LEADER"));
    options.AddPolicy("USER", policy => policy.RequireRole("USER"));
    options.AddPolicy("ALL", policy => policy.RequireRole("ADMIN", "USER", "LEADER"));
});

var cloudinaryAccount = new Account(
    Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME"),
    Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY"),
    Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
);
var cloudinary = new Cloudinary(cloudinaryAccount);
builder.Services.AddSingleton(cloudinary);


builder.WebHost.ConfigureKestrel(options =>
{
   options.ListenAnyIP(7247, listenOptions =>
   {
       listenOptions.UseHttps("server.pfx", "loi123456");
   });
});

// builder.WebHost.ConfigureKestrel(options =>
// {
//     options.ListenAnyIP(7247); // Sử dụng HTTP đơn giản
// });

// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://222.255.214.117:5173", "http://222.255.214.117:5175", "http://222.255.214.117:5174", "https://hrsystem.name.vn") //AllowAnyOrigin()  URL của frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// gener auto
builder.Services.AddHostedService<DailyDataGenerationService>();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();




// sql
var connectionString = Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION_STRING")
                       ?? throw new Exception("Connection string missing.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));


builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(connectionString));

builder.Services.AddHangfireServer();

//config email

builder.Services.Configure<EmailSettings>(options =>
{
    options.SmtpServer = Environment.GetEnvironmentVariable("EmailSettings__SmtpServer")!;
    options.Port = int.Parse(Environment.GetEnvironmentVariable("EmailSettings__Port") ?? "587");
    options.SenderName = Environment.GetEnvironmentVariable("EmailSettings__SenderName")!;
    options.SenderEmail = Environment.GetEnvironmentVariable("EmailSettings__SenderEmail")!;
    options.Password = Environment.GetEnvironmentVariable("EmailSettings__Password")!;
});


builder.Services.AddTransient<IEmailService, EmailService>();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate(); // hoặc db.Database.EnsureCreated();
}

app.UseCors("AllowFrontend");
// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHangfireDashboard("/hangfire");

app.UseAuthentication();
app.UseAuthorization();


// Map Hub vào endpoint
app.MapHub<NotificationHub>("/notificationHub");
app.MapHub<ChatHub>("/chatHub");




app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/", () => "Hello World!");

app.Run();
