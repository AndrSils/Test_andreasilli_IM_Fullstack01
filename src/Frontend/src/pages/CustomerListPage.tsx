// NB: ner routing ho /CustomerList
// Tabella : Name, Address, Email, Phone, IBAN, Category Code, Category Description

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

// NB: searchText è una dipendenza di loadCustomers la ricerca viene attivata a ogni singolo tasto premuto

export default function CustomerListPage() {
  const [list, setList] = useState<CustomerListDTO[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleExport = () => {
    exportToXML(list);
  };


  // esportazione xml, uso escapeXml per errori di formattazione nei caratteri speciali 
  //NB: vedere se gestire altro oltre UTF-8
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

// uso MUI styled StyledTableHeadCell per un colore di sfondo per la leggibilità

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