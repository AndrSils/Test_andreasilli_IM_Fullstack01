import { useState, useCallback } from "react";
import { CustomerListDto, CustomerCategory, CreateCustomerRequest } from "../types/customer";

/**
 * Ho creato questo Custom Hook chiamato 'useCustomers' per centralizzare tutta la logica 
 * di gestione dei clienti. In questo modo, qualsiasi componente della mia app può 
 * accedere facilmente ai dati e alle funzioni di creazione senza duplicare il codice.
 */
export function useCustomers() {
  // Gestisco diversi stati per monitorare i dati dei clienti, le categorie e i caricamenti in corso.
  const [customers, setCustomers] = useState<CustomerListDto[]>([]);
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Questa funzione si occupa di recuperare la lista dei clienti dal backend.
   * Ho implementato il supporto al parametro 'searchText': se presente, viene aggiunto 
   * alla query string per filtrare i risultati direttamente sul database.
   */
  const loadCustomers = useCallback(async (searchText?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = searchText 
        ? `/api/customer/list?searchText=${encodeURIComponent(searchText)}`
        : "/api/customer/list";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Errore HTTP! stato: ${response.status}`);
      }
      
      const data = await response.json();
      setCustomers(data as CustomerListDto[]);
    } catch (error) {
      console.error("Errore nel caricamento dei clienti:", error);
      setError("Impossibile caricare i clienti. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ho aggiunto questa funzione per recuperare le categorie disponibili.
   * Mi serve per popolare il menu a tendina nel modulo di creazione di un nuovo cliente.
   */
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/customercategories/list");
      if (!response.ok) {
        throw new Error(`Errore HTTP! stato: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data as CustomerCategory[]);
    } catch (error) {
      console.error("Errore nel caricamento delle categorie:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  /**
   * Questa funzione gestisce l'invio (POST) di un nuovo cliente al server.
   * Una scelta importante che ho fatto è l'aggiornamento "ottimistico" dello stato locale:
   * non appena il server conferma la creazione, aggiungo il nuovo cliente in cima alla lista 
   * esistente senza dover ricaricare l'intera tabella.
   */
  const createCustomer = useCallback(async (customer: CreateCustomerRequest): Promise<CustomerListDto> => {
    const response = await fetch("/api/customer/create", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      // Lancio un errore specifico se il backend restituisce un messaggio di validazione fallita.
      throw new Error(errorData.error || 'Creazione del cliente fallita');
    }
    
    const newCustomer = await response.json();
    
    // Aggiorno lo stato locale inserendo il nuovo cliente come primo elemento.
    setCustomers(prev => [newCustomer, ...prev]);
    
    return newCustomer;
  }, []);

  // Restituisco tutti gli stati e le funzioni necessari ai componenti React.
  return {
    customers,
    categories,
    loading,
    loadingCategories,
    error,
    loadCustomers,
    loadCategories,
    createCustomer,
  };
}