using Backend.Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.Customers;

public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, CustomerListDTO>
{
    private readonly BackendContext _context;

    public CreateCustomerHandler(BackendContext context)
    {
        _context = context;
    }

    public async Task<CustomerListDTO> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        //  campi obbligatori vanno verificati 
        if (string.IsNullOrWhiteSpace(request.Customer.Name))
            throw new ArgumentException("Name is required");
        
        if (string.IsNullOrWhiteSpace(request.Customer.Email))
            throw new ArgumentException("Email is required");

        // Verifico se la categoria esiste 
        if (request.Customer.CustomerCategoryId.HasValue)
        {
            var categoryExists = await _context.CustomerCategories
                .AnyAsync(c => c.Id == request.Customer.CustomerCategoryId.Value, cancellationToken);
            
            if (!categoryExists)
                throw new ArgumentException("Invalid customer category");
        }

        // Creo il nuovo customer inserendo i dati
        var customer = new Customer
        {
            Name = request.Customer.Name,
            Address = request.Customer.Address,
            Email = request.Customer.Email,
            Phone = request.Customer.Phone,
            Iban = request.Customer.Iban,
            CustomerCategoryId = request.Customer.CustomerCategoryId
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(cancellationToken);

        // Carico la categoria associata 
        await _context.Entry(customer)
            .Reference(c => c.CustomerCategory)
            .LoadAsync(cancellationToken);

        // Restituisco il DTO aggiuinto
        return new CustomerListDTO
        {
            Id = customer.Id,
            Name = customer.Name,
            Address = customer.Address,
            Email = customer.Email,
            Phone = customer.Phone,
            Iban = customer.Iban,
            CategoryCode = customer.CustomerCategory?.Code ?? string.Empty,
            CategoryDescription = customer.CustomerCategory?.Description ?? string.Empty
        };
    }
}