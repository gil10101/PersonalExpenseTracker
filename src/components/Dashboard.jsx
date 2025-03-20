import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExpenseChart from './ExpenseChart';
import ExpensePieChart from './ExpensePieChart';
import ExpenseBarChart from './ExpenseBarChart';
import { listExpenses } from '../utils/expenseAPI';
import { useAuth } from '../utils/AuthContext';
import { toast } from "sonner";

// Import shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Import tabler icons to replace heroicons
import {
  IconArrowUp,
  IconArrowDown,
  IconCoin,
  IconAlertTriangle,
  IconChartBar,
  IconClock,
  IconTag,
  IconCreditCard,
  IconChartLine,
  IconPlus,
  IconChevronRight
} from '@tabler/icons-react';

// Import icon utilities
import { tablerIconProps } from '../utils/iconUtils';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [placeholderCount, setPlaceholderCount] = useState(0);
  const { user } = useAuth();

  // Get user display name (prefer name, fallback to username, then to email)
  const userDisplayName = user?.name || (user?.email ? user.email.split('@')[0] : user?.username) || 'User';

  // Function to check if an expense is a placeholder
  const isPlaceholderExpense = (expense) => {
    return expense.isPlaceholder || 
           expense.id.startsWith('placeholder-') || 
           expense.id.startsWith('recovered-');
  };

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug log to see user information
      console.log('User info in Dashboard:', user);
      console.log('Using userId for expenses:', user?.id);
      
      // Pass the user ID to filter expenses - use ID, not email
      const data = await listExpenses(user?.id);
      
      if (data && Array.isArray(data)) {
        // Reset retry count on success
        setRetryCount(0);
        
        // Calculate total expenses
        const total = data.reduce((sum, expense) => {
          const amount = parseFloat(expense.amount);
          return !isNaN(amount) ? sum + amount : sum;
        }, 0);
        setTotalExpense(total);
        
        // Sort expenses by date (most recent first)
        const sortedExpenses = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
        
        // Count placeholder expenses
        const placeholders = data.filter(expense => isPlaceholderExpense(expense)).length;
        setPlaceholderCount(placeholders);

        // Show success toast if data loaded successfully
        if (data.length > 0) {
          toast.success(`Loaded ${data.length} expenses`);
        }
      } else {
        console.error('Unexpected response format:', data);
        setExpenses([]);
        setTotalExpense(0);
        toast.error("Failed to load expense data");
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
      toast.error("Failed to load expenses. Please try again.");
      
      // If error persists after retries, show a specific message
      if (retryCount > 2) {
        setError('There seems to be a problem connecting to the database. Please try again later.');
      }
      
      setRetryCount(prevCount => prevCount + 1);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, [user]); // Reload when user changes

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get most frequent category
  const getMostFrequentCategory = () => {
    if (!expenses.length) return 'N/A';
    
    const categoryCount = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    let maxCategory = '';
    let maxCount = 0;
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    });
    
    return maxCategory;
  };

  // Get spending by category
  const getSpendingByCategory = () => {
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      const amount = parseFloat(expense.amount) || 0;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
    
    return categoryTotals;
  };

  // Find highest expense
  const getHighestExpense = () => {
    if (!expenses.length) return { name: 'N/A', amount: 0 };
    
    return expenses.reduce((highest, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return amount > highest.amount ? { name: expense.name, amount } : highest;
    }, { name: '', amount: 0 });
  };

  // Get recent expenses (last 5)
  const getRecentExpenses = () => {
    return expenses.slice(0, 5);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="size-12 w-3/4 mb-4" />
          <Skeleton className="size-4 w-1/2" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Skeleton className="h-[180px] rounded-lg" />
          <Skeleton className="h-[180px] rounded-lg" />
          <Skeleton className="h-[180px] rounded-lg" />
          <Skeleton className="h-[180px] rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-lg" />
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert variant="destructive" className="mb-6">
          <IconAlertTriangle {...tablerIconProps('md')} className="text-destructive" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => fetchExpenses()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No expenses message
  if (expenses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[hsl(var(--foreground))]">
              Welcome, {userDisplayName}
            </h1>
            <p className="text-muted-foreground">
              Get started by adding your first expense
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild variant="default" className="group">
              <Link to="/add-expense" className="flex items-center gap-2">
                <span>Add New Expense</span>
                <span className="flex size-6 items-center justify-center rounded-full bg-[hsl(var(--background))]">
                  <IconArrowUp {...tablerIconProps('xs')} className="text-emerald-500" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed bg-muted/30">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconCoin {...tablerIconProps('2xl')} className="text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">No expenses yet</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Track your spending by adding your first expense to get started with your personal finance management
          </p>
          <Button asChild size="lg" className="px-8">
            <Link to="/add-expense">Add Your First Expense</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[hsl(var(--foreground))]">
            Welcome, {userDisplayName}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your expenses
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild variant="default" className="group">
            <Link to="/add-expense" className="flex items-center gap-2">
              <span>Add New Expense</span>
              <span className="flex size-6 items-center justify-center rounded-full bg-[hsl(var(--background))]">
                <IconArrowUp {...tablerIconProps('xs')} />
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconCoin {...tablerIconProps('sm')} className="text-primary" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTag {...tablerIconProps('sm')} className="text-primary" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMostFrequentCategory()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconClock {...tablerIconProps('sm')} className="text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getRecentExpenses().length > 0 ? getRecentExpenses()[0].name : 'No recent expenses'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Expense Charts */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-sm border-[hsl(var(--border))]/50 overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Visual representation of your spending
                  </CardDescription>
                </div>
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <IconChartLine {...tablerIconProps('sm')} className="text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="pie" className="w-full">
                <div className="px-6 py-2 border-b border-[hsl(var(--border))]/30">
                  <TabsList className="grid grid-cols-3 h-9 w-full max-w-[400px]">
                    <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                    <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                    <TabsTrigger value="line">Line Chart</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="pie" className="mt-0 pt-6">
                  <div className="px-6 pb-6">
                    <ExpensePieChart data={expenses} />
                  </div>
                </TabsContent>
                
                <TabsContent value="bar" className="mt-0 pt-6">
                  <div className="px-6 pb-6">
                    <ExpenseBarChart data={expenses} />
                  </div>
                </TabsContent>
                
                <TabsContent value="line" className="mt-0 pt-6">
                  <div className="px-6 pb-6">
                    <ExpenseChart data={expenses} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-[hsl(var(--border))]/50 overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </div>
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <IconClock {...tablerIconProps('sm')} className="text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <div className="px-6 pb-6 space-y-4">
                {getRecentExpenses().length > 0 ? (
                  getRecentExpenses().map(expense => (
                    <div 
                      key={expense.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--accent))]/20 border border-[hsl(var(--border))]/30 hover:bg-[hsl(var(--accent))]/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                          <IconCoin {...tablerIconProps('sm')} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[120px] sm:max-w-[200px]">{expense.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              {expense.category || 'Uncategorized'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">{formatCurrency(expense.amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No expenses yet</p>
                    <Button asChild className="mt-4">
                      <Link to="/add-expense">Add Your First Expense</Link>
                    </Button>
                  </div>
                )}
                
                {getRecentExpenses().length > 0 && (
                  <div className="pt-4 flex justify-center border-t border-[hsl(var(--border))]/30 mt-6">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/expenses" className="flex items-center gap-2">
                        <span>View All Expenses</span>
                        <span className="flex size-6 items-center justify-center rounded-full bg-[hsl(var(--background))]">
                          <IconArrowUp {...tablerIconProps('xs')} className="text-emerald-500" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {placeholderCount > 0 && (
        <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <AlertTitle className="text-amber-800 dark:text-amber-400">Attention</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            You have {placeholderCount} placeholder expense(s) in your data. These are temporary items created during data recovery.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Add these icons that are used in the updated code
const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default Dashboard; 