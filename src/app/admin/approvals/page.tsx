import { listPendingStudents } from "@/modules/auth/service";
import { ApprovalActions } from "./approval-row";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const pending = await listPendingStudents();

  return (
    <div>
      <h1 className="text-2xl font-bold">Pending approvals</h1>
      <p className="mt-1 text-sm text-gray-500">
        {pending.length} student{pending.length === 1 ? "" : "s"} awaiting review.
      </p>

      {pending.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          Nothing to review. 🎉
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pending.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="text-gray-500">{s.email}</div>
                    <div className="text-gray-400">{s.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.section} · {s.provider} · {s.grade}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.state}, {s.country}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ApprovalActions studentId={s.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
