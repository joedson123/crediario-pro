import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
  description?: string;
}

const MetricCard = ({ title, value, icon: Icon, variant = "default", description }: MetricCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-gradient-success text-success-foreground";
      case "warning":
        return "border-warning/20 bg-warning-light text-warning";
      case "destructive":
        return "border-destructive/20 bg-destructive-light text-destructive";
      default:
        return "border-primary/20 bg-gradient-primary text-primary-foreground";
    }
  };

  return (
    <Card className={cn("shadow-card hover:shadow-card-hover transition-all duration-200", getVariantClasses())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-90">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 opacity-80" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs opacity-75 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;