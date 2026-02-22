import { getTickets } from "@/actions/tickets";
import { getDepartments } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { Ticket } from "lucide-react";
import { AdminTicketFilters } from "./admin-ticket-filters";
import { AdminTicketTable } from "./admin-ticket-table";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; departmentId?: string; page?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let data: Awaited<ReturnType<typeof getTickets>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [data, departments] = await Promise.all([
      getTickets({
        status: params.status,
        departmentId: params.departmentId,
        page: params.page ? parseInt(params.page) : 1,
      }),
      getDepartments(),
    ]);
  } catch {
    // DB might not be ready
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          ניהול פניות
        </h1>
        <p className="text-muted-foreground mt-1">
          {data.total} פניות &bull; עמוד {data.page}
        </p>
      </div>

      <AdminTicketFilters
        departments={departments}
        currentStatus={params.status}
        currentDepartment={params.departmentId}
      />

      <AdminTicketTable tickets={data.items} />
    </div>
  );
}
