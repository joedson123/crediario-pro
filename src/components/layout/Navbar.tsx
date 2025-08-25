import { Link, useLocation, useNavigate } from "react-router-dom";
import { DollarSign, Users, Plus, BarChart3, FileText, Receipt, MapPin, TrendingUp, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-primary shadow-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary-foreground" />
            <span className="text-xl font-bold text-primary-foreground">
              Crediário Pro
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "secondary" : "ghost"}
                className={`${
                  isActive("/dashboard")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/clientes">
              <Button
                variant={isActive("/clientes") ? "secondary" : "ghost"}
                className={`${
                  isActive("/clientes")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </Button>
            </Link>
            
            <Link to="/novo-cliente">
              <Button
                variant={isActive("/novo-cliente") ? "secondary" : "ghost"}
                className={`${
                  isActive("/novo-cliente")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </Link>
            
            <Link to="/mapa-clientes">
              <Button
                variant={isActive("/mapa-clientes") ? "secondary" : "ghost"}
                className={`${
                  isActive("/mapa-clientes")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Mapa
              </Button>
            </Link>
            
            <Link to="/relatorios">
              <Button
                variant={isActive("/relatorios") ? "secondary" : "ghost"}
                className={`${
                  isActive("/relatorios")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </Link>

            <Link to="/boletos">
              <Button
                variant={isActive("/boletos") ? "secondary" : "ghost"}
                className={`${
                  isActive("/boletos")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Boletos
              </Button>
            </Link>

            <Link to="/despesas">
              <Button
                variant={isActive("/despesas") ? "secondary" : "ghost"}
                className={`${
                  isActive("/despesas")
                    ? "bg-primary-light text-primary"
                    : "text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Despesas
              </Button>
            </Link>
            
            {/* User Info & Logout */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-primary-foreground/20">
              <div className="flex items-center gap-2 text-primary-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-hover"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/dashboard") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/dashboard")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/clientes" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/clientes") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/clientes")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Button>
              </Link>
              
              <Link to="/novo-cliente" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/novo-cliente") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/novo-cliente")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </Link>
              
              <Link to="/mapa-clientes" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/mapa-clientes") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/mapa-clientes")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Mapa
                </Button>
              </Link>
              
              <Link to="/relatorios" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/relatorios") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/relatorios")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </Link>

              <Link to="/boletos" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/boletos") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/boletos")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Boletos
                </Button>
              </Link>

              <Link to="/despesas" onClick={closeMobileMenu}>
                <Button
                  variant={isActive("/despesas") ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive("/despesas")
                      ? "bg-primary-light text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Despesas
                </Button>
              </Link>
              
              {/* User Info & Logout Mobile */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between p-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;