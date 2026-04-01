using Backend.Features.Employees;
using Backend.Features.Suppliers;
using Backend.Features.Customers;

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

        // aggiungo qui la mia nuova rotto dell'endpoint
         apiGroup.MapGet("customer/list", async (string? searchText, IMediator mediator) => 
        {
            var query = new GetCustomerListQuery(searchText);
            return Results.Ok(await mediator.Send(query));
        })
        .WithName("GetCustomersList")
        .WithOpenApi();
                    
    }


}
