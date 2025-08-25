import { Link, useLocation } from "react-router-dom";
import { DollarSign, Users, Plus, BarChart3, FileText, Receipt, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="text-primary-foreground">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;