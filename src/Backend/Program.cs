// using Backend.Features.Customers;
// using MediatR; 

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());

// Setup Database
var connectionString = builder.Configuration.GetConnectionString("Backend") ?? throw new ArgumentNullException("Backend Connectionsting not set");
builder.Services.AddDbContext<BackendContext>(x => x.UseSqlite(connectionString));

// Build app
var app = builder.Build();

// popola il db
app.InitAndSeedBackendContest();

// Register Swagger UI -> configura swagger
app.UseSwaggerDocumentation();

// Register all the routes for the api
app.UseApiRoutes();

// aggiungo il mio endpoint
/*
// lo metto nelle rotte con gli altri
app.MapGet("/api/customer/list", async (string? searchText, IMediator mediator) =>
{
    var result = await mediator.Send(new GetCustomerListQuery(searchText));
    return Results.Ok(result);
})
.WithName("GetCustomerList")
.WithOpenApi();
*/

// Run the application
app.Run();
