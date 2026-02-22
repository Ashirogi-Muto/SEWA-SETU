import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getIssues() {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    return issues
  } catch (error) {
    console.error('Failed to fetch issues:', error)
    return []
  }
}

async function getStats() {
  try {
    const total = await prisma.issue.count()
    const open = await prisma.issue.count({ where: { status: 'OPEN' } })
    
    return { total, open }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return { total: 0, open: 0 }
  }
}

export default async function AdminPage() {
  const [issues, stats] = await Promise.all([getIssues(), getStats()])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor reported civic issues
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Issues</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open Issues</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>Latest reported civic issues</CardDescription>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No issues reported yet. Report your first issue!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-mono text-xs">
                      {issue.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {issue.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${
                        issue.severity >= 7 ? 'text-red-600' : 
                        issue.severity >= 4 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {issue.severity}/10
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {issue.location}
                    </TableCell>
                    <TableCell>
                      <span className="uppercase px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {issue.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
