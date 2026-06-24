using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using PatientenPortal.Components;
using PatientenPortal.Data;
using PatientenPortal.Endpoints;
using PatientenPortal.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
var dbPath = builder.Configuration["DbPath"] ?? "/var/data/patientenportal/portal.db";
var dbDir = Path.GetDirectoryName(dbPath);
if (!string.IsNullOrEmpty(dbDir) && !Directory.Exists(dbDir))
    Directory.CreateDirectory(dbDir);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Services
builder.Services.AddHttpClient<EmailService>();
builder.Services.AddScoped<StorageService>();
builder.Services.AddScoped<AuditService>();

// Auth
var sessionTimeout = builder.Configuration.GetValue<int>("SessionTimeoutSeconds", 1800);
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/auth/logout";
        options.AccessDeniedPath = "/login";
        options.ExpireTimeSpan = TimeSpan.FromSeconds(sessionTimeout);
        options.SlidingExpiration = true;
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = SameSiteMode.Lax;
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
builder.Services.AddCascadingAuthenticationState();

// Blazor
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Antiforgery
builder.Services.AddAntiforgery();

var app = builder.Build();

// Ensure DB
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    await DbSeeder.SeedAsync(db, builder.Configuration, scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>());
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

// Map Minimal API endpoints
app.MapAuthEndpoints();
app.MapDownloadEndpoints();
app.MapApiV1Endpoints();

// Blazor
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
