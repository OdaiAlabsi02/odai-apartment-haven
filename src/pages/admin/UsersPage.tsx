import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No users to display yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 