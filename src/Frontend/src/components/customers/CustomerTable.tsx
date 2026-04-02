import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  styled,
  tableCellClasses,
} from "@mui/material";
import { CustomerListDto } from "../../types/customer";

/**
 * Ho definito queste Props per rendere il componente della tabella indipendente.
 * Riceve la lista dei clienti da visualizzare, lo stato di caricamento e il testo di ricerca
 * per poter mostrare messaggi contestuali all'utente.
 */
interface CustomerTableProps {
  customers: CustomerListDto[];
  loading: boolean;
  searchText: string;
}

export default function CustomerTable({ customers, loading, searchText }: CustomerTableProps) {
  return (
    /**
     * Utilizzo Paper come contenitore per dare alla tabella un effetto "sollevato" 
     * e dei bordi rifiniti, tipico del Material Design.
     */
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="customers table">
        <TableHead>
          <TableRow>
            {/* Utilizzo il mio componente stilizzato per le intestazioni */}
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
          {/* Gestisco lo stato di caricamento: se i dati stanno arrivando dal backend,
              mostro una barra di progresso circolare centrata nella tabella.
          */}
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            /* Se non ci sono dati, distinguo tra due casi:
               1. L'utente ha cercato qualcosa (mostro "No customers found")
               2. La lista è semplicemente vuota (mostro "No customers available")
            */
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                {searchText ? "No customers found matching your search" : "No customers available"}
              </TableCell>
            </TableRow>
          ) : (
            /* Se i dati sono presenti, mappo l'array 'customers' per generare una riga 
               per ogni cliente, includendo i dettagli della categoria.
            */
            customers.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.iban}</TableCell>
                {/* Gestisco il caso in cui i dati opzionali della categoria siano mancanti con un trattino */}
                <TableCell>{row.categoryCode || '-'}</TableCell>
                <TableCell>{row.categoryDescription || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * Ho creato questo componente stilizzato utilizzando l'utility 'styled' di MUI.
 * Ho scelto un colore di sfondo primario e il testo in grassetto bianco per le 
 * intestazioni, così da renderle chiaramente distinguibili dai dati della tabella.
 */
const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}));