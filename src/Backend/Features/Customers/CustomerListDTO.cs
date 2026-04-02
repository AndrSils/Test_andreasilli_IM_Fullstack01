using System.Text.Json.Serialization;
namespace Backend.Features.Customers;

// Creo il DTO
public class  CustomerListDTO  {
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Iban { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public string CategoryDescription { get; set; } = string.Empty;  

}