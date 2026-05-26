import { AppHeader } from "@/components/app-shell/AppHeader";
import { AppScreen } from "@/components/app-shell/AppScreen";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <AppScreen>
      <AppHeader title="Create invoice" eyebrow="AI-assisted payment request" />
      <InvoiceForm />
      <BottomNav />
    </AppScreen>
  );
}
