import { Snackbar, Alert } from "@mui/material";

/**
 * Ho creato questa interfaccia per definire esattamente come deve apparire la notifica.
 * Mi permette di passare dinamicamente il messaggio, il colore (severity) e la durata,
 * rendendo il componente estremamente versatile e riutilizzabile in tutta l'applicazione.
 */
interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  // Utilizzo i tipi predefiniti di MUI per gestire i diversi stati (successo, errore, ecc.)
  severity: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  autoHideDuration?: number;
}

export default function NotificationSnackbar({ 
  open, 
  message, 
  severity, 
  onClose, 
  autoHideDuration = 6000 
}: NotificationSnackbarProps) {
  return (
    /**
     * Lo Snackbar gestisce il posizionamento e il tempo di visualizzazione.
     * Ho scelto di posizionarlo in basso al centro (bottom center) per renderlo 
     * ben visibile ma non invasivo durante l'utilizzo dell'app.
     */
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration} // Dopo 6 secondi (default) la notifica scompare da sola.
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {/* L'Alert all'interno dello Snackbar serve a dare lo stile visivo corretto.
        In base alla 'severity', il componente cambierà colore (es. verde per success, rosso per error).
      */}
      <Alert severity={severity} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}