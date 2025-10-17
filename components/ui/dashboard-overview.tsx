import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"; // Assumes shadcn's utility for class merging
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';

// Define the icon type. Using React.ElementType for flexibility.
type IconType = React.ElementType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

// Define trend types
export type TrendType = 'up' | 'down' | 'neutral';

// --- 📦 API (Props) Definition ---
export interface DashboardMetricCardProps {
  /** The main value of the metric (e.g., "1,234", "$5.6M", "92%"). */
  value: string;
  /** The descriptive title of the metric (e.g., "Total Users", "Revenue"). */
  title: string;
  /** Optional icon to display in the card header. */
  icon?: IconType;
  /** The percentage or absolute change for the trend (e.g., "2.5%"). */
  trendChange?: string;
  /** The direction of the trend ('up', 'down', 'neutral'). */
  trendType?: TrendType;
  /** Optional class name for the card container. */
  className?: string;
}

/**
 * A professional, animated metric card for admin dashboards.
 * Displays a key value, title, icon, and trend indicator with Framer Motion hover effects.
 */
const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  value,
  title,
  icon: IconComponent,
  trendChange,
  trendType = 'neutral',
  className,
}) => {
  // Determine trend icon and color
  const TrendIcon = trendType === 'up' ? ArrowUp : trendType === 'down' ? ArrowDown : Minus;
  const trendColorClass =
    trendType === 'up'
      ? "text-green-600 dark:text-green-400"
      : trendType === 'down'
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }} // Subtle lift and shadow on hover
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "cursor-pointer rounded-lg", // Ensure cursor indicates interactivity
        className
      )}
    >
      <Card className="h-full transition-colors duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {IconComponent && (
            <IconComponent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">{value}</div>
          {trendChange && (
            <p className={cn("flex items-center text-xs font-medium", trendColorClass)}>
              <TrendIcon className="h-3 w-3 mr-1" aria-hidden="true" />
              {trendChange} {trendType === 'up' ? "increase" : trendType === 'down' ? "decrease" : "change"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Business Control Center Dashboard Overview Component
export const BusinessDashboardOverview: React.FC<{
  totalRevenue?: number;
  totalExpenses?: number;
  totalClients?: number;
  activeProjects?: number;
  loading?: boolean;
}> = ({
  totalRevenue = 0,
  totalExpenses = 0,
  totalClients = 0,
  activeProjects = 0,
  loading = false,
}) => {
  const revenueGrowth = totalRevenue > 100000 ? "+12.5%" : "+0%";
  const clientGrowth = totalClients > 1 ? "+5.2%" : "+0%";
  const projectGrowth = activeProjects > 0 ? "+8.1%" : "+0%";
  const expensesTrend = totalExpenses > 0 ? "-2.1%" : "+0%";

  if (loading) {
    return (
      <div className="p-8 bg-background border rounded-lg max-w-7xl mx-auto shadow-md">
        <h3 className="text-xl font-semibold text-foreground mb-6">Dashboard Overview</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="h-32">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background border rounded-lg max-w-7xl mx-auto shadow-md">
      <h3 className="text-xl font-semibold text-foreground mb-6">Business Control Center</h3>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total Revenue"
          value={`$${(totalRevenue / 100).toLocaleString()}`}
          icon={DollarSign}
          trendChange={revenueGrowth}
          trendType="up"
        />
        <DashboardMetricCard
          title="Total Expenses"
          value={`$${(totalExpenses / 100).toLocaleString()}`}
          icon={AlertCircle}
          trendChange={expensesTrend}
          trendType="down"
        />
        <DashboardMetricCard
          title="Active Clients"
          value={totalClients.toString()}
          icon={Users}
          trendChange={clientGrowth}
          trendType="up"
        />
        <DashboardMetricCard
          title="AI Projects"
          value={activeProjects.toString()}
          icon={Clock}
          trendChange={projectGrowth}
          trendType="up"
        />
      </div>
    </div>
  );
};

const ExampleUsage = () => {
  return (
    <div className="p-8 bg-background border rounded-lg max-w-7xl mx-auto shadow-md">
      <h3 className="text-xl font-semibold text-foreground mb-6">Dashboard Overview</h3>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total Users"
          value="2,350"
          icon={Users}
          trendChange="+180"
          trendType="up"
        />
        <DashboardMetricCard
          title="Revenue"
          value="$12,450"
          icon={DollarSign}
          trendChange="-2.5%"
          trendType="down"
        />
        <DashboardMetricCard
          title="Avg. Session"
          value="4m 32s"
          icon={Clock}
          trendChange="+0.5s"
          trendType="neutral" // Or "up" if positive
        />
        <DashboardMetricCard
          title="Open Tickets"
          value="12"
          icon={AlertCircle} // Using AlertCircle from lucide-react if needed
          trendChange="+3"
          trendType="up"
          className="lg:col-span-1" // Example of custom class for layout
        />
      </div>
    </div>
  );
};

export default ExampleUsage;
