import { redirect } from "next/navigation";

export default function LegacyLakeRoute({ params }: { params: { id: string } }) {
  redirect(`/region/${params.id}`);
}
