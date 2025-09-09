import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, Mail, Lock, User, Users, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import medicalHero from '@/assets/medical-hero.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Bienvenido",
        description: "Sesión iniciada correctamente",
      });
    } else {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const demoLogins = [
    {
      role: 'Administrador',
      email: 'admin@clinica.com',
      icon: User,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      role: 'Doctor',
      email: 'doctor@clinica.com',
      icon: Users,
      gradient: 'from-green-500 to-green-600'
    },
    {
      role: 'Paciente',
      email: 'paciente@email.com',
      icon: Heart,
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden md:flex md:flex-1 relative">
        <img 
          src={medicalHero} 
          alt="Medical Clinic" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <Stethoscope className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">CandyHoppe</h1>
            <p className="text-xl opacity-90">Sistema Integral de Gestión Médica</p>
            <p className="text-sm opacity-75 mt-2">Gestión moderna para consultorios médicos</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile header */}
          <div className="md:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">MediClinic</h1>
            </div>
          </div>
          
          <Card className="medical-card border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede a tu área personalizada del sistema médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full medical-gradient medical-transition"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                </Button>
              </form>
              
              {/* Demo accounts */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Cuentas de demostración (contraseña: demo123)
                </p>
                <div className="grid gap-2">
                  {demoLogins.map((demo) => (
                    <Button
                      key={demo.role}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail(demo.email);
                        setPassword('demo123');
                      }}
                      className="justify-start medical-transition"
                    >
                      <demo.icon className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">{demo.role}</span>
                      <span className="text-xs text-muted-foreground">{demo.email}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;