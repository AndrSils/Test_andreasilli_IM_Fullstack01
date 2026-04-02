using MediatR;

namespace Backend.Features.Customers;

public record CreateCustomerCommand(CreateCustomerRequest Customer) : IRequest<CustomerListDTO>;