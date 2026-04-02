
// Tabella : Name, Address, Email, Phone, IBAN, Category Code, Category Description
// NB: nel routing ho /CustomerList
// AppRouter.tsx e ShellHeader.tsx mi gestiscono già la navigazione
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Box,
  Button,
  CircularProgress,
  styled,
  tableCellClasses,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";

interface CustomerListDTO {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
  categoryCode: string;
  categoryDescription: string;
}

interface CustomerCategory {
  id: number;
  code: string;
  description: string;
}

interface CreateCustomerRequest {
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
  customerCategoryId: number | null;
}

// NB: searchText è una dipendenza di loadCustomers la ricerca viene attivata a ogni singolo tasto premuto
export default function CustomerListPage() {
  const [list, setList] = useState<CustomerListDTO[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State per il dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State per il form
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    name: '',
    address: '',
    email: '',
    phone: '',
    iban: '',
    customerCategoryId: null
  });
  
  // State per validazione
  const [formErrors, setFormErrors] = useState<{name?: string; email?: string}>({});

  // uso useCallback per loadCustpoem per non ricrere quando passo a useEffect
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    // logica del filtro e seguo l'api creata nel backend
    try {
      const url = searchText 
        ? `/api/customer/list?searchText=${encodeURIComponent(searchText)}`
        : "/api/customer/list";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setList(data as CustomerListDTO[]);
    } catch (error) {
      console.error("Error loading customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchText]);

	// Carico le categorie associabili ai customers
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/customercategories/list");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data as CustomerCategory[]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

	const handleOpenDialog = () => {
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
      iban: '',
      customerCategoryId: null
    });
    setFormErrors({});
    setOpenDialog(true);
    loadCategories();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (field: keyof CreateCustomerRequest, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field === 'name' || field === 'email') {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {name?: string; email?: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch("/api/customer/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }
      
      const newCustomer = await response.json();
      
      // Aggiungo il nuovo customer inserito alla lista
      setList(prev => [newCustomer, ...prev]);
      
      // Mostro messaggio di successo se vado a bun fine 
      setSnackbar({
        open: true,
        message: `Customer "${newCustomer.name}" created successfully!`,
        severity: 'success'
      });
      
      // Chiudo il dialog
      setOpenDialog(false);
      
    } catch (error) {
      console.error("Error creating customer:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to create customer',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
							  
  const handleExport = () => {
    exportToXML(list);
  };

  // esportazione xml, uso escapeXml per errori di formattazione nei caratteri speciali 
  const exportToXML = (data: CustomerListDTO[]) => {
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
    
    // Crea e scarica il file
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

  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

// uso MUI styled StyledTableHeadCell per un colore di sfondo per la leggibilità
  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Customers
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Search by name or email"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          size="small"
          placeholder="Type to filter..."
        />
        <Button
          variant="contained"
		  color="secondary"
          onClick={handleOpenDialog}
        >
          Add Customer
        </Button>
        <Button
          variant="contained"					
          color="primary"
          onClick={handleExport}
          disabled={list.length === 0}
        >
          Export XML
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="customers table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
              <StyledTableHeadCell>IBAN</StyledTableHeadCell>
              <StyledTableHeadCell>Category Code</StyledTableHeadCell>
              <StyledTableHeadCell>Category Description</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  {searchText ? "No customers found matching your search" : "No customers available"}
                </TableCell>
              </TableRow>
            ) : (
              list.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.iban}</TableCell>
                  <TableCell>{row.categoryCode || '-'}</TableCell>
                  <TableCell>{row.categoryDescription || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

		{/* Dialog per aggiungere nuovo customer */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name *"
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
              label="Address"
              value={formData.address}
              onChange={(e) => handleFormChange('address', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Phone"
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
            <FormControl fullWidth>
              <InputLabel>Category (Optional)</InputLabel>
              <Select
                value={formData.customerCategoryId ?? ''}
                onChange={(e) => handleFormChange('customerCategoryId', e.target.value ? Number(e.target.value) : null)}
                label="Category (Optional)"
              >
                <MenuItem value="">None</MenuItem>
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
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar per notifiche */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}



const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}));