import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : undefined;
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="text-red-600">Unauthorized</p>
      </main>
    );
  }
  const groups = await prisma.usage.groupBy({ by: ['userId', 'date'], _sum: { tokensIn: true, tokensOut: true, ttsSeconds: true } });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Usage Dashboard</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th className="py-2">User</th><th>Date</th><th>Tokens In</th><th>Tokens Out</th><th>TTS s</th></tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={`${g.userId}-${g.date.toISOString()}`} className="border-b">
              <td className="py-2">{g.userId}</td>
              <td>{g.date.toISOString().slice(0,10)}</td>
              <td>{g._sum.tokensIn ?? 0}</td>
              <td>{g._sum.tokensOut ?? 0}</td>
              <td>{g._sum.ttsSeconds ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}



