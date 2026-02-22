import { getTicket } from "@/actions/tickets";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TicketDetailClient } from "./ticket-detail-client";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ticket, session] = await Promise.all([getTicket(id), auth()]);
  if (!ticket || !session) notFound();

  return (
    <TicketDetailClient
      ticket={ticket}
      currentUser={{
        id: session.user.id,
        role: (session.user as { role: string }).role,
      }}
    />
  );
}
