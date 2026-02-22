import { getDepartments } from "@/actions/admin";
import { NewTicketClient } from "./new-ticket-client";

export default async function NewTicketPage() {
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];
  try {
    departments = await getDepartments();
  } catch {}

  return <NewTicketClient departments={departments} />;
}
