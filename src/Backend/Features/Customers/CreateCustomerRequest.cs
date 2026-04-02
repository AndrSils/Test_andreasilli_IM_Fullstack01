namespace Backend.Features.Customers;

public class CreateCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Iban { get; set; } = string.Empty;
    public int? CustomerCategoryId { get; set; }
}