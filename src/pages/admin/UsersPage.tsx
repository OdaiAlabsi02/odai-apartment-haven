import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Calendar, Search, UserCheck, UserX, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// New type matching the new schema
type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  is_verified?: boolean;
  is_host?: boolean;
  role?: string;
  profile_picture_url?: string;
  status?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'suspended':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'guest':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (first: string, last: string) => {
    return (first[0] || '') + (last[0] || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <UserX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>
      {/* Stats Cards (optional, can be implemented with real data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        {/* Add more stats as needed */}
      </div>
      {/* Users Table */}
      <div className="bg-card rounded-lg shadow p-4">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-muted-foreground mr-2" />
          <Input placeholder="Search users..." className="max-w-xs" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      {user.profile_picture_url ? (
                        <AvatarImage src={user.profile_picture_url} alt={user.first_name + ' ' + user.last_name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span>{user.first_name} {user.last_name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status || 'active')}>{user.status || 'active'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role || 'guest')}>{user.role || 'guest'}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}