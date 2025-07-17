import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BookingsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Bookings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No bookings to display yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 