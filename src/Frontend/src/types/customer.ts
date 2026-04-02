/**
 * Ho definito questa interfaccia per mappare esattamente i dati che ricevo dal backend
 * quando richiedo la lista dei clienti. Include sia i dati anagrafici della tabella Customer
 * che i dettagli della categoria collegata
 */
export interface CustomerListDto {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
  // Questi due campi derivano dalla join con la tabella CustomerCategory[cite: 122, 124].
  categoryCode: string;
  categoryDescription: string;
}

/**
 * Questa interfaccia rappresenta la struttura base di una categoria di clienti.
 * Mi serve per gestire i dati provenienti dalla tabella CustomerCategory nel database 
 */
export interface CustomerCategory {
  id: number;
  code: string;
  description: string;
}

/**
 * Ho creato questo modello per gestire la creazione di un nuovo cliente.
 * Rispetto alla lista, qui invio l'ID numerico della categoria (customerCategoryId) 
 * invece dei campi descrittivi, per permettere al backend di salvare correttamente la relazione
 */
export interface CreateCustomerRequest {
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
  customerCategoryId: number | null; // Uso null nel caso il cliente non abbia ancora una categoria assegnata.
}