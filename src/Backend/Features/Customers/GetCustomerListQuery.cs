using MediatR;
namespace Backend.Features.Customers;

// creo la query
public record GetCustomerListQuery(string? SearchText) : IRequest<List<CustomerListDTO>>;