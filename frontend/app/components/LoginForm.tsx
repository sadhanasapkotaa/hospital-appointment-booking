import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User, UserRole } from '../App';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

// Mock users for demonstration
const mockUsers = [
  { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'user' as UserRole },
  { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' as UserRole },
  { id: 'receptionist1', name: 'Mary Wilson', email: 'mary@hospital.com', role: 'receptionist' as UserRole },
  { id: 'doctor1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@hospital.com', role: 'doctor' as UserRole },
  { id: 'doctor2', name: 'Dr. Michael Chen', email: 'michael.chen@hospital.com', role: 'doctor' as UserRole },
];

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by role (simplified authentication)
    const user = mockUsers.find(u => u.role === selectedRole);
    if (user) {
      onLogin(user);
    }

    setIsLoading(false);
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Sign In to HealthPal</CardTitle>
        <CardDescription>Access your hospital appointment portal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Login As</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Patient</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or try demo accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" onClick={() => handleQuickLogin('user')}>
            Demo Patient Login
          </Button>
          <Button variant="outline" onClick={() => handleQuickLogin('receptionist')}>
            Demo Receptionist Login
          </Button>
          <Button variant="outline" onClick={() => handleQuickLogin('doctor')}>
            Demo Doctor Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}