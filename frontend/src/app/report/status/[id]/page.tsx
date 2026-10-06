import { CitizenStatus } from "@/components/citizen/citizen-status";

export default async function CitizenStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CitizenStatus id={id} />;
}
