using Backend.Features.Employees;
using Backend.Features.Suppliers;
using Backend.Features.Customers;
using Backend.Features.CustomerCategories;

namespace Backend;

static class RouteRegistrationExtensions
{
    public static void UseApiRoutes(this WebApplication app)
    {
        var apiGroup = app.MapGroup("api");

        apiGroup.MapGet("suppliers/list", async ([AsParameters] SupplierListQuery query, IMediator mediator) => await mediator.Send(query))
                    .WithName("GetSuppliersList")
                    .WithOpenApi();

        apiGroup.MapGet("employees/list", async ([AsParameters] EmployeesListQuery query, IMediator mediator) => await mediator.Send(query))
                    .WithName("GetEmployeesList")
                    .WithOpenApi();

        // aggiungo qui la mia nuova rotta dell'endpoint per il customers
         apiGroup.MapGet("customer/list", async (string? searchText, IMediator mediator) => 
        {
            var query = new GetCustomerListQuery(searchText);
            return Results.Ok(await mediator.Send(query));
        })
        .WithName("GetCustomersList")
        .WithOpenApi();

        // Aggingo end poit per tutte le categorie dei clienti
        apiGroup.MapGet("customercategories/list", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCustomerCategoriesQuery());
            return Results.Ok(result);
        })
        .WithName("GetCustomerCategoriesList")
        .WithOpenApi();
    

        // POST endpoint per creare un nuovo customer
        apiGroup.MapPost("customer/create", async (CreateCustomerRequest request, IMediator mediator) =>
        {
            try
            {
                var result = await mediator.Send(new CreateCustomerCommand(request));
                return Results.Ok(result);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("CreateCustomer")
        .WithOpenApi();

                    
    }


}
