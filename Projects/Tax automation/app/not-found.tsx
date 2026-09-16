import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Page not found"
        subtitle="The page or calculation you requested does not exist or has been removed."
      />
      <Card>
        <CardBody className="flex flex-col items-start gap-4">
          <p className="text-sm text-ink-soft">
            If you followed a link to a saved calculation, that record may have
            been deleted. Otherwise, head back to the dashboard or browse your
            calculation history.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-navy px-4 text-sm font-medium text-white transition-colors hover:bg-navy-soft"
            >
              Back to dashboard
            </Link>
            <Link
              href="/history"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-surface-dim hover:text-ink"
            >
              View calculation history
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
