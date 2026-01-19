import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function NotConnected() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>
        Please connect your wallet.
      </AlertDescription>
    </Alert>
  )
} 
