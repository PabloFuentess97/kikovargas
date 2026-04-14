export default function ContactsLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      <div>
        <div className="h-8 w-32 rounded-lg skeleton-admin" />
        <div className="mt-2 h-4 w-44 rounded skeleton-admin" />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left"><div className="h-3 w-16 rounded skeleton-admin" /></th>
              <th className="px-4 py-3 text-left"><div className="h-3 w-14 rounded skeleton-admin" /></th>
              <th className="px-4 py-3 text-left"><div className="h-3 w-14 rounded skeleton-admin" /></th>
              <th className="px-4 py-3 text-left"><div className="h-3 w-12 rounded skeleton-admin" /></th>
              <th className="px-4 py-3 text-right"><div className="h-3 w-14 rounded skeleton-admin ml-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="h-4 w-[55%] rounded skeleton-admin" />
                  <div className="mt-1.5 h-3 w-[70%] rounded skeleton-admin" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-[80%] rounded skeleton-admin" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-18 rounded-full skeleton-admin" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 rounded skeleton-admin" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="h-7 w-12 rounded-lg skeleton-admin ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
