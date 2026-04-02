// DTO per la categoria
namespace Backend.Features.CustomerCategories;

public class CustomerCategoryDTO
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}