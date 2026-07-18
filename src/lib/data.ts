import { db } from "@/lib/db";
import {
  e392Rent,
  e392Utilities,
  chitrakootRent,
  construction,
  returnItems,
  miscellaneous,
  properties,
  tenants,
  tenancies,
  users,
  activityLog,
  pageViews,
  documents,
} from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getAllUsers() {
  return db
    .select({ id: users.id, name: users.name, username: users.username, role: users.role })
    .from(users)
    .orderBy(users.name);
}


export async function getAllRent() {
  return db.select().from(e392Rent).orderBy(desc(e392Rent.month));
}

export async function getAllUtilities() {
  return db.select().from(e392Utilities).orderBy(desc(e392Utilities.date));
}

export async function getAllChitrakootRent() {
  return db.select().from(chitrakootRent).orderBy(desc(chitrakootRent.month));
}

export async function getAllConstruction() {
  return db.select().from(construction).orderBy(desc(construction.date));
}

export async function getAllReturnItems() {
  return db.select().from(returnItems).orderBy(desc(returnItems.date));
}

export async function getAllMisc() {
  return db.select().from(miscellaneous).orderBy(desc(miscellaneous.date));
}

export async function getAllProperties() {
  return db.select().from(properties).orderBy(properties.name);
}

export async function getAllTenants() {
  return db
    .select({
      id: tenants.id,
      name: tenants.name,
      phone: tenants.phone,
      email: tenants.email,
      idProofType: tenants.idProofType,
      idProofNumber: tenants.idProofNumber,
      occupation: tenants.occupation,
      numberOfOccupants: tenants.numberOfOccupants,
      emergencyContactName: tenants.emergencyContactName,
      emergencyContactPhone: tenants.emergencyContactPhone,
      policeVerified: tenants.policeVerified,
      policeVerificationDate: tenants.policeVerificationDate,
      notes: tenants.notes,
      createdAt: tenants.createdAt,
      updatedAt: tenants.updatedAt,
      username: users.username,
    })
    .from(tenants)
    .leftJoin(users, eq(users.tenantId, tenants.id))
    .orderBy(tenants.name);
}

export async function getAllTenancies() {
  return db.select().from(tenancies).orderBy(desc(tenancies.startDate));
}

export async function getPropertyWithTenancy(propertyId: number) {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  const tenancyRows = await db
    .select()
    .from(tenancies)
    .where(eq(tenancies.propertyId, propertyId))
    .orderBy(desc(tenancies.startDate));
  return { property, tenancies: tenancyRows };
}

// Derives occupancy per property: a property is "occupied" if it has a
// tenancy with status ACTIVE. This is computed, not stored, per the
// product decision to auto-derive occupancy rather than hand-toggle it.
export async function getPropertiesWithOccupancy() {
  const [allProperties, allTenancies, allTenants] = await Promise.all([
    getAllProperties(),
    getAllTenancies(),
    getAllTenants(),
  ]);

  const tenantsById = new Map(allTenants.map((t) => [t.id, t]));

  return allProperties.map((property) => {
    const activeTenancy = allTenancies.find(
      (t) => t.propertyId === property.id && t.status === "ACTIVE"
    );
    const tenant = activeTenancy ? tenantsById.get(activeTenancy.tenantId) : undefined;
    return {
      ...property,
      occupied: !!activeTenancy,
      activeTenancy,
      tenant,
    };
  });
}

// Mirrors getPropertiesWithOccupancy from the tenant's side: for each
// tenant, find their active tenancy (if any) and the property it's for.
export async function getTenantsWithCurrentProperty() {
  const [allTenants, allTenancies, allProperties] = await Promise.all([
    getAllTenants(),
    getAllTenancies(),
    getAllProperties(),
  ]);

  const propertiesById = new Map(allProperties.map((p) => [p.id, p]));

  return allTenants.map((tenant) => {
    const activeTenancy = allTenancies.find(
      (t) => t.tenantId === tenant.id && t.status === "ACTIVE"
    );
    const property = activeTenancy ? propertiesById.get(activeTenancy.propertyId) : undefined;
    const tenancyHistory = allTenancies.filter((t) => t.tenantId === tenant.id);
    return {
      ...tenant,
      activeTenancy,
      property,
      tenancyHistory,
    };
  });
}

export async function getDashboardSummary() {
  const [rent, utilities, chitrakoot, constructionRows, returns, misc, propertiesWithOccupancy] =
    await Promise.all([
      getAllRent(),
      getAllUtilities(),
      getAllChitrakootRent(),
      getAllConstruction(),
      getAllReturnItems(),
      getAllMisc(),
      getPropertiesWithOccupancy(),
    ]);

  const sum = (arr: { amount?: string; rent?: string }[], key: "amount" | "rent" = "amount") =>
    arr.reduce((acc, r) => acc + parseFloat((r as Record<string, string>)[key] ?? "0"), 0);

  const e392RentTotal = sum(rent, "rent");
  const e392UtilitiesTotal = sum(utilities);
  const chitrakootRentTotal = sum(chitrakoot);
  const chitrakootSubmittedTotal = chitrakoot.reduce(
    (acc, r) => acc + (r.submittedAmount ? parseFloat(r.submittedAmount) : 0),
    0
  );
  const constructionTotal = sum(constructionRows);
  const returnsTotal = sum(returns);
  const miscTotal = sum(misc);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rentThisMonth = rent.filter((r) => r.month.startsWith(currentMonthKey));
  const floorTotals = {
    GROUND: sum(rent.filter((r) => r.floor === "GROUND"), "rent"),
    FIRST: sum(rent.filter((r) => r.floor === "FIRST"), "rent"),
    SECOND: sum(rent.filter((r) => r.floor === "SECOND"), "rent"),
  };

  const totalIncome = e392RentTotal + chitrakootRentTotal;
  const totalExpense = e392UtilitiesTotal + constructionTotal + miscTotal;
  const netProfit = totalIncome - totalExpense;
  const pendingChitrakootDifference = chitrakootRentTotal - chitrakootSubmittedTotal;

  // Outstanding rent: expected rent this month per occupied property,
  // minus what's actually been recorded as paid this month.
  const occupiedCount = propertiesWithOccupancy.filter((p) => p.occupied).length;
  const vacantCount = propertiesWithOccupancy.length - occupiedCount;
  const expectedRentThisMonth = propertiesWithOccupancy
    .filter((p) => p.occupied)
    .reduce((acc, p) => acc + (p.monthlyRent ? parseFloat(p.monthlyRent) : 0), 0);
  const collectedRentThisMonth =
    sum(rentThisMonth, "rent") +
    sum(chitrakoot.filter((c) => c.month.startsWith(currentMonthKey)));
  const outstandingRent = Math.max(0, expectedRentThisMonth - collectedRentThisMonth);

  // Last 6 months income vs expense, for the trend chart.
  const monthlyTrend = buildMonthlyTrend(rent, chitrakoot, utilities, constructionRows, misc);

  // Expense breakdown by category, for the pie/donut chart.
  const expenseBreakdown = [
    { name: "Utilities", value: e392UtilitiesTotal },
    { name: "Construction", value: constructionTotal },
    { name: "Miscellaneous", value: miscTotal },
  ].filter((d) => d.value > 0);

  return {
    e392RentTotal,
    e392UtilitiesTotal,
    chitrakootRentTotal,
    chitrakootSubmittedTotal,
    pendingChitrakootDifference,
    constructionTotal,
    returnsTotal,
    miscTotal,
    floorTotals,
    rentThisMonthCount: rentThisMonth.length,
    totalIncome,
    totalExpense,
    netProfit,
    occupiedCount,
    vacantCount,
    outstandingRent,
    monthlyTrend,
    expenseBreakdown,
    counts: {
      rent: rent.length,
      utilities: utilities.length,
      chitrakoot: chitrakoot.length,
      construction: constructionRows.length,
      returns: returns.length,
      misc: misc.length,
      properties: propertiesWithOccupancy.length,
    },
    recentRent: rent.slice(0, 5),
    recentMisc: misc.slice(0, 5),
    recentConstruction: constructionRows.slice(0, 5),
  };
}

type DatedAmount = { month?: string; date?: string | null; amount?: string; rent?: string };

function buildMonthlyTrend(
  rent: DatedAmount[],
  chitrakoot: DatedAmount[],
  utilities: DatedAmount[],
  constructionRows: DatedAmount[],
  misc: DatedAmount[]
) {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    months.push({ key, label });
  }

  return months.map(({ key, label }) => {
    const income =
      rent.filter((r) => r.month?.startsWith(key)).reduce((a, r) => a + parseFloat(r.rent ?? "0"), 0) +
      chitrakoot
        .filter((c) => c.month?.startsWith(key))
        .reduce((a, c) => a + parseFloat(c.amount ?? "0"), 0);
    const expense =
      utilities
        .filter((u) => u.date?.startsWith(key))
        .reduce((a, u) => a + parseFloat(u.amount ?? "0"), 0) +
      constructionRows
        .filter((c) => c.date?.startsWith(key))
        .reduce((a, c) => a + parseFloat(c.amount ?? "0"), 0) +
      misc
        .filter((m) => m.date?.startsWith(key))
        .reduce((a, m) => a + parseFloat(m.amount ?? "0"), 0);
    return { month: label, income, expense, profit: income - expense };
  });
}

export type Notification = {
  id: string;
  title: string;
  description: string;
  tone: "pending" | "overdue" | "default";
};

export async function getNotifications(role?: string, tenantId?: number): Promise<Notification[]> {
  const notifications: Notification[] = [];

  const formatAmount = (n: number) =>
    n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  if (role === "TENANT" && tenantId != null) {
    const tenantNotifications = await getTenantPortalData(tenantId);
    const tenancy = tenantNotifications.activeTenancy;
    if (tenancy) {
      if (tenancy.agreementStatus === "EXPIRED") {
        notifications.push({
          id: `agreement-expired-${tenancy.id}`,
          title: "Your rent agreement has expired",
          description: tenancy.agreementRenewalDate
            ? `Renewal was due on ${tenancy.agreementRenewalDate}.`
            : "Renew it from your tenant portal.",
          tone: "overdue",
        });
      } else if (tenancy.agreementStatus === "DUE_FOR_RENEWAL") {
        notifications.push({
          id: `agreement-due-${tenancy.id}`,
          title: "Your rent agreement is due for renewal",
          description: tenancy.agreementRenewalDate
            ? `Renewal due on ${tenancy.agreementRenewalDate}.`
            : "Renew it from your tenant portal.",
          tone: "pending",
        });
      }
    }

    return notifications;
  }

  const summary = await getDashboardSummary();

  if (summary.outstandingRent > 0) {
    notifications.push({
      id: "outstanding-rent",
      title: "Rent outstanding this month",
      description: `${formatAmount(summary.outstandingRent)} not yet recorded as collected.`,
      tone: "overdue",
    });
  }

  if (summary.pendingChitrakootDifference > 0) {
    notifications.push({
      id: "chitrakoot-pending",
      title: "Chitrakoot rent not fully submitted",
      description: `${formatAmount(summary.pendingChitrakootDifference)} collected but not yet submitted to Nitin.`,
      tone: "pending",
    });
  }

  if (summary.vacantCount > 0) {
    notifications.push({
      id: "vacant-properties",
      title: `${summary.vacantCount} ${summary.vacantCount === 1 ? "property" : "properties"} vacant`,
      description: "No active tenant recorded for this property.",
      tone: "pending",
    });
  }

  const tenantsWithProperty = await getTenantsWithCurrentProperty();
  for (const tenant of tenantsWithProperty) {
    const tenancy = tenant.activeTenancy;
    if (!tenancy) continue;

    if (tenancy.agreementStatus === "EXPIRED") {
      notifications.push({
        id: `agreement-expired-${tenancy.id}`,
        title: `${tenant.name}'s rent agreement has expired`,
        description: tenancy.agreementRenewalDate
          ? `Was due for renewal on ${tenancy.agreementRenewalDate}.`
          : "Renew it from the tenant's profile.",
        tone: "overdue",
      });
    } else if (tenancy.agreementStatus === "DUE_FOR_RENEWAL") {
      notifications.push({
        id: `agreement-due-${tenancy.id}`,
        title: `${tenant.name}'s rent agreement is due for renewal`,
        description: tenancy.agreementRenewalDate
          ? `Renewal due on ${tenancy.agreementRenewalDate}.`
          : "Renew it from the tenant's profile.",
        tone: "pending",
      });
    }
  }

  return notifications;
}

export async function getDocumentsForUser(role: string, tenantId?: number) {
  if (role === "TENANT" && tenantId != null) {
    return db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId))
      .orderBy(desc(documents.createdAt));
  }

  return getAllDocuments();
}

export async function getTenantPortalData(tenantId: number) {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const [activeTenancy] = await db
    .select()
    .from(tenancies)
    .where(and(eq(tenancies.tenantId, tenantId), eq(tenancies.status, "ACTIVE")))
    .limit(1);

  const property = activeTenancy
    ? (await db.select().from(properties).where(eq(properties.id, activeTenancy.propertyId)).limit(1))[0]
    : null;

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.tenantId, tenantId))
    .orderBy(desc(documents.createdAt));

  const pendingActions: Notification[] = [];
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  if (property) {
    const expectedRent = property.monthlyRent ? parseFloat(property.monthlyRent) : 0;
    let rentRecordedThisMonth = false;

    switch (property.rentLedger) {
      case "E392_GROUND":
      case "E392_FIRST":
      case "E392_SECOND": {
        const [rentEntry] = await db
          .select()
          .from(e392Rent)
          .where(and(eq(e392Rent.propertyId, property.id), eq(e392Rent.month, currentMonth)))
          .limit(1);
        rentRecordedThisMonth = !!rentEntry;
        break;
      }
      case "CHITRAKOOT_SHOP": {
        const [rentEntry] = await db
          .select()
          .from(chitrakootRent)
          .where(and(eq(chitrakootRent.propertyId, property.id), eq(chitrakootRent.month, currentMonth)))
          .limit(1);
        rentRecordedThisMonth = !!rentEntry;
        break;
      }
      case "OTHER":
      default:
        break;
    }

    if (!rentRecordedThisMonth && expectedRent > 0) {
      pendingActions.push({
        id: "tenant-rent-due",
        title: "This month's rent has not been recorded",
        description: `Your property has a rent of ₹${expectedRent.toLocaleString("en-IN")}. Add a receipt so the owner can track it.`,
        tone: "overdue",
      });
    }
  }

  if (activeTenancy) {
    if (activeTenancy.agreementStatus === "EXPIRED") {
      pendingActions.push({
        id: `tenant-agreement-expired-${activeTenancy.id}`,
        title: "Your agreement has expired",
        description: activeTenancy.agreementRenewalDate
          ? `Agreement renewal was due on ${activeTenancy.agreementRenewalDate}.`
          : "Please ask the owner to renew your agreement.",
        tone: "overdue",
      });
    } else if (activeTenancy.agreementStatus === "DUE_FOR_RENEWAL") {
      pendingActions.push({
        id: `tenant-agreement-due-${activeTenancy.id}`,
        title: "Your agreement is due for renewal",
        description: activeTenancy.agreementRenewalDate
          ? `Renewal due on ${activeTenancy.agreementRenewalDate}.`
          : "Please ask the owner to renew your agreement soon.",
        tone: "pending",
      });
    }
  }

  return {
    tenant,
    property,
    activeTenancy,
    docs,
    pendingActions,
  };
}

// Reports: property-level profitability (rent collected per floor minus
// the utility bills tied to that floor — a simple but real P&L per unit).
export async function getPropertyProfitability() {
  const [rent, utilities] = await Promise.all([getAllRent(), getAllUtilities()]);

  const floors = ["GROUND", "FIRST", "SECOND"] as const;
  return floors.map((floor) => {
    const income = rent
      .filter((r) => r.floor === floor)
      .reduce((a, r) => a + parseFloat(r.rent), 0);
    const expense = utilities
      .filter((u) => u.floor === floor)
      .reduce((a, u) => a + parseFloat(u.amount), 0);
    return {
      name: `${floor.charAt(0)}${floor.slice(1).toLowerCase()} Floor`,
      income,
      expense,
      profit: income - expense,
    };
  });
}

// 12-month income/expense series for the yearly reports view.
export async function getYearlyTrend() {
  const [rent, chitrakoot, utilities, constructionRows, misc] = await Promise.all([
    getAllRent(),
    getAllChitrakootRent(),
    getAllUtilities(),
    getAllConstruction(),
    getAllMisc(),
  ]);

  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    months.push({ key, label });
  }

  return months.map(({ key, label }) => {
    const income =
      rent.filter((r) => r.month.startsWith(key)).reduce((a, r) => a + parseFloat(r.rent), 0) +
      chitrakoot
        .filter((c) => c.month.startsWith(key))
        .reduce((a, c) => a + parseFloat(c.amount), 0);
    const expense =
      utilities
        .filter((u) => u.date.startsWith(key))
        .reduce((a, u) => a + parseFloat(u.amount), 0) +
      constructionRows
        .filter((c) => c.date?.startsWith(key))
        .reduce((a, c) => a + parseFloat(c.amount), 0) +
      misc
        .filter((m) => m.date.startsWith(key))
        .reduce((a, m) => a + parseFloat(m.amount), 0);
    return { month: label, income, expense, profit: income - expense };
  });
}

// Tenant payment behaviour: for the Chitrakoot tenant relationship, how
// promptly has rent been submitted relative to the month it covers.
export async function getTenantPaymentBehavior() {
  const chitrakoot = await getAllChitrakootRent();
  return chitrakoot
    .filter((c) => c.submittedDate)
    .map((c) => {
      const monthDate = new Date(c.month + "T00:00:00");
      const submittedDate = new Date(c.submittedDate + "T00:00:00");
      const daysLate = Math.round(
        (submittedDate.getTime() - monthDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        month: c.month,
        label: monthDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        daysLate,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

// ---------- Activity Log ----------
export async function getRecentActivity(limit = 10) {
  return db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

export async function getAllActivity(filters?: {
  userId?: number;
  entityType?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  const query = db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);
  return query;
}

// ---------- Page View Analytics ----------
export async function getPageViewStats() {
  const all = await db.select().from(pageViews).orderBy(desc(pageViews.createdAt));

  const totalViews = all.length;
  const uniqueSessions = new Set(all.map((v) => v.sessionId)).size;

  // Per-page breakdown
  const byPage: Record<string, number> = {};
  for (const v of all) {
    byPage[v.page] = (byPage[v.page] ?? 0) + 1;
  }
  const pageBreakdown = Object.entries(byPage)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  // Active users in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = new Set(
    all
      .filter((v) => new Date(v.createdAt) > sevenDaysAgo && v.userId)
      .map((v) => v.userId)
  ).size;

  // Daily view trend for last 14 days
  const dailyTrend: Record<string, number> = {};
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyTrend[key] = 0;
  }
  for (const v of all) {
    const key = new Date(v.createdAt).toISOString().slice(0, 10);
    if (key in dailyTrend) dailyTrend[key]++;
  }
  const viewTrend = Object.entries(dailyTrend).map(([date, count]) => ({
    date: date.slice(5), // "MM-DD"
    count,
  }));

  return {
    totalViews,
    uniqueSessions,
    recentUsers,
    pageBreakdown,
    viewTrend,
  };
}

// ---------- Documents ----------
export async function getAllDocuments() {
  return db
    .select()
    .from(documents)
    .orderBy(desc(documents.createdAt));
}
