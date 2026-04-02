import {
  Typography,
  TextField,
  Box,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useCustomers } from "../hooks/useCustomers";
import CustomerTable from "../components/customers/CustomerTable";
import CustomerFormDialog from "../components/customers/CustomerFormDialog";
import NotificationSnackbar from "../components/common/NotificationSnackbar";
import { CreateCustomerRequest } from "../types/customer";

export default function CustomerListPage() {
  /**
   * Gestisco gli stati locali per l'interazione dell'utente: 
   * il testo di ricerca, l'apertura del dialogo per il nuovo cliente 
   * e il sistema di notifiche (snackbar).
   */
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  /**
   * Utilizzo il mio hook personalizzato 'useCustomers' per ottenere tutti i dati e le funzioni necessarie.
   * Questo mi permette di tenere questa pagina molto pulita, delegando la logica API all'hook.
   */
  const { 
    customers, 
    categories, 
    loading, 
    loadingCategories,
    error, 
    loadCustomers, 
    loadCategories,
    createCustomer 
  } = useCustomers();

  /**
   * Ho configurato questo useEffect affinché ogni volta che il testo di ricerca cambia, 
   * venga attivata automaticamente la funzione di caricamento con il filtro applicato.
   */
  useEffect(() => {
    loadCustomers(searchText);
  }, [searchText, loadCustomers]);

  // Gestisco l'aggiornamento del testo di ricerca digitato dall'utente.
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  /**
   * Quando l'utente decide di aggiungere un cliente, apro il dialogo e 
   * contemporaneamente avvio il caricamento delle categorie per popolare il menu a tendina.
   */
  const handleOpenDialog = () => {
    setOpenDialog(true);
    loadCategories();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  /**
   * Questa funzione fa da ponte tra il form e il database. 
   * Se il salvataggio ha successo, mostro una notifica verde; 
   * in caso contrario, ne mostro una rossa con il messaggio d'errore.
   */
 const handleCreateCustomer = async (customerData: CreateCustomerRequest) => {
    try {
      const newCustomer = await createCustomer(customerData);
      setNotification({
        open: true,
        message: `Cliente "${newCustomer.name}" creato con successo!`,
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Errore durante la creazione',
        severity: 'error'
      });
      throw error; // Rilancio l'errore per farlo gestire anche al componente Form
    }
  };

  const handleExport = () => {
    exportToXML(customers);
  };

  /**
   * Ho implementato la logica di esportazione XML come richiesto dai requisiti.
   * Genero una stringa formattata, la trasformo in un "Blob" e forzo il download 
   * di un file .xml con un nome che include la data e l'ora corrente.
   */
  const exportToXML = (data: typeof customers) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<customers>\n';
    
    data.forEach(customer => {
      xml += '  <customer>\n';
      xml += `    <id>${customer.id}</id>\n`;
      xml += `    <name>${escapeXml(customer.name)}</name>\n`;
      xml += `    <address>${escapeXml(customer.address)}</address>\n`;
      xml += `    <email>${escapeXml(customer.email)}</email>\n`;
      xml += `    <phone>${escapeXml(customer.phone)}</phone>\n`;
      xml += `    <iban>${escapeXml(customer.iban)}</iban>\n`;
      xml += `    <categoryCode>${escapeXml(customer.categoryCode)}</categoryCode>\n`;
      xml += `    <categoryDescription>${escapeXml(customer.categoryDescription)}</categoryDescription>\n`;
      xml += '  </customer>\n';
    });
    
    xml += '</customers>';
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Funzione di utilità per assicurarmi che i dati testuali non rompano la struttura XML
   * se contengono caratteri speciali.
   */
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Clienti
      </Typography>

      {/* Barra degli strumenti: Ricerca, Aggiunta ed Esportazione */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Cerca per nome o email"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          size="small"
          placeholder="Scrivi per filtrare..."
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenDialog}
        >
          Aggiungi Cliente
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={customers.length === 0} // Disabilito l'export se la tabella è vuota
        >
          Esporta XML
        </Button>
      </Box>

      {/* Gestione errori globale della pagina */}
      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      {/* Componente Tabella: visualizza i dati */}
      <CustomerTable 
        customers={customers} 
        loading={loading} 
        searchText={searchText}
      />

      {/* Componente Dialog: modulo di creazione */}
      <CustomerFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleCreateCustomer}
        categories={categories}
        loadingCategories={loadingCategories}
      />

      {/* Componente Notifica: feedback all'utente */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}