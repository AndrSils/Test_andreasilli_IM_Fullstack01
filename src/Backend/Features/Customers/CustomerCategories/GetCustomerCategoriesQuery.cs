using MediatR;

namespace Backend.Features.CustomerCategories;

public record GetCustomerCategoriesQuery() : IRequest<List<CustomerCategoryDTO>>;