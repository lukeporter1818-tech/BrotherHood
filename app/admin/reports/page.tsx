import { prisma } from "@/lib/prisma";
import { ModerationActions } from "./ModerationActions";

function excerpt(text: string, max = 80) {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const metadata = {
  title: "Moderation queue — Brotherhood Admin",
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetType: true,
      reason: true,
      createdAt: true,
      reporter: { select: { anonHandle: true } },
      post: {
        select: {
          id: true,
          body: true,
          deletedAt: true,
          room: { select: { slug: true, displayName: true } },
        },
      },
      reply: {
        select: {
          id: true,
          body: true,
          deletedAt: true,
          postId: true,
          post: { select: { room: { select: { slug: true } } } },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Moderation queue
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {reports.length} pending{" "}
        {reports.length === 1 ? "report" : "reports"}
      </p>

      {reports.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
          All clear.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {reports.map((r) => {
            const isPost = r.targetType === "POST";
            const content = isPost ? r.post : r.reply;
            const alreadyDeleted = content?.deletedAt !== null;

            let roomSlug = "";
            let roomName = "";
            let contentLink = "";

            if (isPost && r.post) {
              roomSlug = r.post.room.slug;
              roomName = r.post.room.displayName;
              contentLink = `/rooms/${roomSlug}/${r.post.id}`;
            } else if (!isPost && r.reply) {
              roomSlug = r.reply.post.room.slug;
              roomName = roomSlug;
              contentLink = `/rooms/${roomSlug}/${r.reply.postId}`;
            }

            const bodyText = content?.body ?? "";

            return (
              <div
                key={r.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {r.targetType}
                      </span>
                      <span>·</span>
                      <span>{roomName}</span>
                      <span>·</span>
                      <span>Reported by {r.reporter.anonHandle}</span>
                      <span>·</span>
                      <span>{formatWhen(r.createdAt)}</span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Reason: {r.reason}
                    </p>

                    {alreadyDeleted ? (
                      <p className="mt-1 text-sm italic text-zinc-400 dark:text-zinc-600">
                        [Content already removed]
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">
                        &ldquo;{excerpt(bodyText)}&rdquo;
                      </p>
                    )}

                    {contentLink && (
                      <a
                        href={contentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400"
                      >
                        View in context ↗
                      </a>
                    )}
                  </div>

                  <ModerationActions reportId={r.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
