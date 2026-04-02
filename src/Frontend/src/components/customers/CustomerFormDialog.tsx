import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CustomerCategory, CreateCustomerRequest } from "../../types/customer";

/**
 * Ho definito queste Props per rendere il componente riutilizzabile. 
 * Mi permettono di controllare dall'esterno se il form è aperto,
 * passare la lista delle categorie caricate dal database e gestire il salvataggio.
 */
interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: CreateCustomerRequest) => Promise<void>;
  categories: CustomerCategory[];
  loadingCategories?: boolean;
}

/**
 * Ho creato un oggetto per lo stato iniziale in modo da poter resettare 
 * facilmente tutti i campi del form ogni volta che viene riaperto.
 */
const initialFormData: CreateCustomerRequest = {
  name: '',
  address: '',
  email: '',
  phone: '',
  iban: '',
  customerCategoryId: null
};

export default function CustomerFormDialog({ 
  open, 
  onClose, 
  onSave, 
  categories,
  loadingCategories = false 
}: CustomerFormDialogProps) {
  // Gestisco lo stato del modulo, degli errori di validazione e dello stato di caricamento durante il salvataggio.
  const [formData, setFormData] = useState<CreateCustomerRequest>(initialFormData);
  const [formErrors, setFormErrors] = useState<{name?: string; email?: string}>({});
  const [saving, setSaving] = useState(false);

  /**
   * Utilizzo questo hook per assicurarmi che ogni volta che apro il dialogo, 
   * il form sia pulito e non mostri residui di inserimenti precedenti o vecchi errori.
   */
  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setFormErrors({});
      setSaving(false);
    }
  }, [open]);

  /**
   * Ho creato una funzione centralizzata per gestire i cambiamenti nei campi.
   * Mi permette anche di rimuovere i messaggi di errore non appena l'utente ricomincia a scrivere.
   */
  const handleFormChange = (field: keyof CreateCustomerRequest, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' || field === 'email') {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Ho implementato una validazione manuale per assicurarmi che i campi obbligatori (Nome ed Email) 
   * siano compilati correttamente e che l'email rispetti un formato valido prima di inviare i dati al backend.
   */
  const validateForm = (): boolean => {
    const errors: {name?: string; email?: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Il nome è obbligatorio';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato email non valido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Questa funzione gestisce l'invio. Mostro un indicatore di caricamento (CircularProgress) 
   * per migliorare la User Experience e chiudo il dialogo solo se il salvataggio va a buon fine.
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Errore durante l'invio del modulo:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
      <DialogContent>
        {/* Organizzo i campi in un Box con gap costante per un layout pulito */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Nome *"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
            fullWidth
          />
          <TextField
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email}
            required
            fullWidth
          />
          <TextField
            label="Indirizzo"
            value={formData.address}
            onChange={(e) => handleFormChange('address', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Telefono"
            value={formData.phone}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            fullWidth
          />
          <TextField
            label="IBAN"
            value={formData.iban}
            onChange={(e) => handleFormChange('iban', e.target.value)}
            fullWidth
          />
          {/* Ho inserito un menu a tendina per selezionare la categoria, mappando dinamicamente la lista delle categorie */}
          <FormControl fullWidth>
            <InputLabel>Categoria (Opzionale)</InputLabel>
            <Select
              value={formData.customerCategoryId ?? ''}
              onChange={(e) => handleFormChange('customerCategoryId', e.target.value ? Number(e.target.value) : null)}
              label="Categoria (Opzionale)"
              disabled={loadingCategories}
            >
              <MenuItem value="">Nessuna</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.code} - {category.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}