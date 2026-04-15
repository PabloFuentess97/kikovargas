export default function PostsLoading() {
  return (
    <div className="admin-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-24 rounded-lg skeleton-admin" />
          <div className="mt-2 h-4 w-36 rounded skeleton-admin" />
        </div>
        <div className="h-10 w-32 rounded-lg skeleton-admin" />
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left"><div className="h-2.5 w-14 rounded skeleton-admin" /></th>
              <th className="px-5 py-3.5 text-left"><div className="h-2.5 w-14 rounded skeleton-admin" /></th>
              <th className="px-5 py-3.5 text-left"><div className="h-2.5 w-12 rounded skeleton-admin" /></th>
              <th className="px-5 py-3.5 text-left"><div className="h-2.5 w-12 rounded skeleton-admin" /></th>
              <th className="px-5 py-3.5 text-right"><div className="h-2.5 w-16 rounded skeleton-admin ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-4">
                  <div className="h-4 w-[70%] rounded skeleton-admin" />
                  <div className="mt-1.5 h-3 w-[40%] rounded skeleton-admin" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-6 w-20 rounded-full skeleton-admin" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-20 rounded skeleton-admin" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-20 rounded skeleton-admin" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-7 w-16 rounded-lg skeleton-admin" />
                    <div className="h-7 w-18 rounded-lg skeleton-admin" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
