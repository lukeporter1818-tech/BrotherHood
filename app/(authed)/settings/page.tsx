import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6 px-5 py-8">
      <h1 className="text-[24px] font-semibold text-text">Settings</h1>

      <section className="rounded-xl border border-crisis/40 bg-crisis/5 p-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-crisis">
          Danger zone
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-text/90">
          Delete your Brotherhood account. Your Bench chats and private history
          will be removed. Your posts and replies will stay in the rooms,
          shown as <code>[deleted]</code>.
        </p>
        <Link
          href="/settings/delete"
          className="mt-4 inline-flex h-[40px] items-center justify-center rounded-[10px] border border-crisis bg-crisis/10 px-4 text-[14px] font-semibold text-crisis hover:bg-crisis/20"
        >
          Delete my account
        </Link>
      </section>
    </div>
  );
}
