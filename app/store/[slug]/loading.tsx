export default function StoreLoading() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 text-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
          <div className="absolute inset-4 rounded-full bg-primary/10" />
          <div className="absolute inset-[1.35rem] rounded-full bg-primary" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Loading store
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
          Preparing storefront
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Products, store details, and gallery assets are being arranged.
        </p>
      </div>
    </main>
  );
}
