export default function LandingLoading() {
  return (
    <div className="bg-void min-h-screen">
      {/* Hero skeleton */}
      <section className="relative h-[100svh] min-h-[600px] max-h-[1200px] flex items-end overflow-hidden">
        {/* Background shimmer */}
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 bg-gradient-to-t from-void from-3% via-void/60 via-45% to-void/5" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />

        <div className="relative z-10 container-landing pb-16 sm:pb-20 md:pb-28 lg:pb-36">
          <div className="w-10 h-[1px] skeleton mb-6 md:mb-8" />
          <div className="h-[clamp(3.5rem,14vw,12rem)] w-[70%] skeleton mb-3" />
          <div className="h-[clamp(3.5rem,14vw,12rem)] w-[55%] skeleton mb-8 md:mb-12" />
          <div className="flex items-center gap-3 mb-8 md:mb-12">
            <div className="h-[1px] w-6 skeleton" />
            <div className="h-3 w-48 skeleton" />
          </div>
          <div className="h-11 w-44 skeleton" />
        </div>
      </section>

      {/* About skeleton */}
      <section className="section-py bg-surface">
        <div className="container-landing">
          <div className="mb-12 md:mb-16 lg:mb-20">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-[1px] skeleton" />
              <div className="h-2.5 w-20 skeleton" />
            </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-6">
            <div className="lg:col-span-5">
              <div className="aspect-[3/4] skeleton" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <div className="h-12 w-[80%] skeleton" />
              <div className="h-12 w-[60%] skeleton" />
              <div className="space-y-3 mt-6">
                <div className="h-3 w-full skeleton" />
                <div className="h-3 w-full skeleton" />
                <div className="h-3 w-[90%] skeleton" />
                <div className="h-3 w-[75%] skeleton" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-border-subtle p-5">
                    <div className="h-8 w-16 skeleton mb-2" />
                    <div className="h-2.5 w-20 skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar skeleton */}
      <div className="bg-elevated border-y border-border-subtle">
        <div className="container-landing py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-10 w-20 skeleton mx-auto mb-2" />
                <div className="h-2.5 w-24 skeleton mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery skeleton */}
      <section className="section-py bg-void">
        <div className="container-landing">
          <div className="mb-12 md:mb-16 lg:mb-20">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-[1px] skeleton" />
              <div className="h-2.5 w-20 skeleton" />
            </div>
            <div className="h-12 w-[50%] skeleton mb-2" />
            <div className="h-12 w-[40%] skeleton" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[260px] lg:auto-rows-[300px] gap-1 md:gap-1.5">
            <div className="col-span-2 row-span-2 skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="row-span-2 skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </div>
      </section>

      {/* Blog skeleton */}
      <section className="section-py bg-void">
        <div className="container-landing">
          <div className="mb-12 md:mb-16 lg:mb-20">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-[1px] skeleton" />
              <div className="h-2.5 w-14 skeleton" />
            </div>
            <div className="h-12 w-[45%] skeleton mb-2" />
            <div className="h-12 w-[35%] skeleton" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[16/10] skeleton mb-5" />
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-2 w-16 skeleton" />
                  <div className="w-0.5 h-0.5 rounded-full bg-border-subtle" />
                  <div className="h-2 w-10 skeleton" />
                </div>
                <div className="h-5 w-[85%] skeleton mb-2" />
                <div className="h-3 w-full skeleton mb-1" />
                <div className="h-3 w-[70%] skeleton" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact skeleton */}
      <section className="section-py bg-surface">
        <div className="container-landing max-w-3xl">
          <div className="text-center mb-12">
            <div className="flex items-center gap-3.5 justify-center mb-5">
              <div className="w-10 h-[1px] skeleton" />
              <div className="h-2.5 w-20 skeleton" />
            </div>
            <div className="h-12 w-[60%] skeleton mx-auto mb-2" />
            <div className="h-12 w-[45%] skeleton mx-auto" />
          </div>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="h-12 skeleton" />
              <div className="h-12 skeleton" />
            </div>
            <div className="h-12 skeleton" />
            <div className="h-32 skeleton" />
            <div className="h-12 w-40 skeleton" />
          </div>
        </div>
      </section>
    </div>
  );
}
