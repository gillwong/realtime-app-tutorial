import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  return <pre>{JSON.stringify(session)}</pre>;
}
