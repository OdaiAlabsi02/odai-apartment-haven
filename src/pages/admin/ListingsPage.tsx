import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ListingsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Listings</h1>
          <p className="text-muted-foreground">Manage all apartment listings here.</p>
        </div>
        <Button variant="default" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Listing
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No listings yet. Click "Add Listing" to create your first apartment.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 