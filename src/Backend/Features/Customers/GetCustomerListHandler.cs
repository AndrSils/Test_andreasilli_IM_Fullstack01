using Backend.Infrastructure;
using Backend.Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.Customers;

public class GetCustomerListHandler : IRequestHandler<GetCustomerListQuery, List<CustomerListDTO>>
{
    private readonly BackendContext _context;

    public GetCustomerListHandler(BackendContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerListDTO>> Handle(GetCustomerListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Customers
            .Include(c => c.CustomerCategory)
            .AsQueryable();

        // faccio il filtro se lo inserisco nella chiamata
        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var search = request.SearchText.ToLower();
            query = query.Where(c => 
                (c.Name != null && c.Name.ToLower().Contains(search)) || 
                (c.Email != null && c.Email.ToLower().Contains(search)));
        }

        var customers = await query
            .Select(c => new CustomerListDTO
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                Email = c.Email,
                Phone = c.Phone,
                Iban = c.Iban,
                CategoryCode = c.CustomerCategory != null ? c.CustomerCategory.Code : string.Empty,
                CategoryDescription = c.CustomerCategory != null ? c.CustomerCategory.Description : string.Empty
            })
            .ToListAsync(cancellationToken);

        return customers;
    }
}