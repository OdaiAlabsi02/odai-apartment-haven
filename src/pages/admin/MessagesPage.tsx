import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MailOpen, Reply, Archive, Trash2, Search, User } from "lucide-react";

const mockMessages = [
  {
    id: "1",
    from: "John Doe",
    email: "john@example.com",
    subject: "Question about Modern Downtown Loft",
    message: "Hi, I'm interested in booking your loft for next month. Is it available?",
    date: "2024-01-15",
    isRead: false,
    apartment: "Modern Downtown Loft"
  },
  {
    id: "2",
    from: "Sarah Wilson",
    email: "sarah@example.com",
    subject: "Booking confirmation needed",
    message: "I've made a booking but haven't received confirmation yet. Could you please check?",
    date: "2024-01-14",
    isRead: true,
    apartment: "Cozy Garden Apartment"
  },
  {
    id: "3",
    from: "Mike Johnson",
    email: "mike@example.com",
    subject: "Amenities inquiry",
    message: "Does the penthouse have parking available? Also, what's the check-in process?",
    date: "2024-01-13",
    isRead: false,
    apartment: "Luxury Penthouse Suite"
  }
];

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with guests and manage inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{mockMessages.length}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-warning">
                  {mockMessages.filter(m => !m.isRead).length}
                </p>
              </div>
              <MailOpen className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-success">
                  {mockMessages.filter(m => m.isRead).length}
                </p>
              </div>
              <Badge className="bg-success text-success-foreground">
                {Math.round((mockMessages.filter(m => m.isRead).length / mockMessages.length) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="text-sm text-muted-foreground">New</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {mockMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet.</p>
              <p className="text-sm">Messages from guests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 cursor-pointer ${
                    !message.isRead ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{message.from}</div>
                        <div className="text-sm text-muted-foreground">{message.email}</div>
                      </div>
                      {!message.isRead && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(message.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Re: {message.apartment}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="font-medium text-sm mb-1">{message.subject}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {message.message}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}