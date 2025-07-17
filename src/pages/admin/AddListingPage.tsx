import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AddListingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Listing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            Listing form coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 