import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MessagesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No messages yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 