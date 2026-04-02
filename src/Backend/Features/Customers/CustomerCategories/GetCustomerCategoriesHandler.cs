using Backend.Infrastructure.Database;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.CustomerCategories;

public class GetCustomerCategoriesHandler : IRequestHandler<GetCustomerCategoriesQuery, List<CustomerCategoryDTO>>
{
    private readonly BackendContext _context;

    public GetCustomerCategoriesHandler(BackendContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerCategoryDTO>> Handle(GetCustomerCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.CustomerCategories
            .Select(c => new CustomerCategoryDTO
            {
                Id = c.Id,
                Code = c.Code,
                Description = c.Description
            })
            .OrderBy(c => c.Code)
            .ToListAsync(cancellationToken);

        return categories;
    }
}