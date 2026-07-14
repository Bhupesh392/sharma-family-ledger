import { ShieldCheck, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAllUsers } from "@/lib/data";
import { SectionHeader } from "@/components/ledger/section-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemePicker } from "@/components/ledger/theme-picker";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const isTenant = user?.role === "TENANT";
  const allUsers = isAdmin ? await getAllUsers() : [];

  const accountRoleLabel = isAdmin ? "Admin" : isTenant ? "Tenant" : "Member";
  const accountBadgeVariant = isAdmin ? "admin" : isTenant ? "accent" : "default";
  const accountDescription = isAdmin
    ? "As an admin, you can delete entries and view the full family member list below."
    : isTenant
    ? "You can access the tenant portal and manage your rental documents and receipts."
    : "You can view all data and add or edit entries. Only an admin can delete entries.";

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Settings" description="Your account and app preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-soft mb-4">
            Choose how Sharma Estates looks on this device.
          </p>
          <ThemePicker />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <Badge variant={accountBadgeVariant} className="mt-1">
                {accountRoleLabel}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-foreground-faint mt-4">{accountDescription}</p>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo" />
              Family member accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {allUsers.map((u, i) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between py-2.5 ${i !== 0 ? "app-divider" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-foreground-soft">@{u.username}</p>
                  </div>
                  <Badge variant={u.role === "ADMIN" ? "admin" : u.role === "TENANT" ? "accent" : "default"}>
                    {u.role === "ADMIN" ? "Admin" : u.role === "TENANT" ? "Tenant" : "Member"}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground-faint mt-4">
              To add or remove accounts, use the seed script or database directly &mdash;
              there&apos;s no in-app account management yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
