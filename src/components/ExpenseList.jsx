import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listExpenses, deleteExpense } from '../utils/expenseAPI';
import { useAuth } from '../utils/AuthContext';
import { toast } from "sonner";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  IconPencil,
  IconTrash,
  IconAlertTriangle,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconArrowsUpDown,
  IconEye,
  IconPlus
} from '@tabler/icons-react';
import { tablerIconProps } from '../utils/iconUtils';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [placeholderCount, setPlaceholderCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const { user } = useAuth();

  // Load expenses on component mount
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug log to see user information
      console.log('User info in ExpenseList:', user);
      
      // Use consistent userId field from the user object
      console.log('Using userId for expenses:', user?.id);
      
      // Pass the user ID to filter expenses
      const data = await listExpenses(user?.id);
      
      if (data && Array.isArray(data)) {
        // Sort expenses by date (most recent first)
        const sortedExpenses = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
        
        // Count placeholder expenses
        const placeholders = data.filter(expense => 
          expense.isPlaceholder || 
          expense.id.startsWith('placeholder-') || 
          expense.id.startsWith('recovered-')
        ).length;
        setPlaceholderCount(placeholders);

        if (data.length > 0) {
          toast.success(`Loaded ${data.length} expenses`);
        }
      } else {
        console.error('Unexpected response format:', data);
        setExpenses([]);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
      // If error persists after retries, show a specific message
      if (retryCount > 2) {
        setError('There seems to be a problem connecting to the database. Please try again later.');
      }
      setRetryCount(prevCount => prevCount + 1);
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Function to delete an expense
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(true);
      setDeleteItemId(id);
      
      await deleteExpense(id);
      
      // Remove deleted expense from state
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
      setDialogOpen(false);
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Failed to delete expense. Please try again.');
    } finally {
      setDeleteLoading(false);
      setDeleteItemId(null);
    }
  };

  // Function to filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.name?.toLowerCase().includes(searchLower) ||
      expense.category?.toLowerCase().includes(searchLower) ||
      expense.amount?.toString().includes(searchTerm)
    );
  });

  // Function to sort expenses
  const sortExpenses = (expenses) => {
    if (!sortConfig.key) return expenses;
    
    return [...expenses].sort((a, b) => {
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;
      
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortConfig.key === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };
  
  // Function to handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted and filtered expenses
  const sortedAndFilteredExpenses = sortExpenses(filteredExpenses);

  // Render loading state
  if (loading) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Expenses</h1>
          <Skeleton className="size-10 w-32" />
        </div>
        <div className="bg-card rounded-md border shadow-sm">
          <div className="p-4 flex items-center justify-between border-b">
            <Skeleton className="size-10 w-64" />
            <Skeleton className="size-10 w-32" />
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="size-12 w-full" />
            <Skeleton className="size-12 w-full" />
            <Skeleton className="size-12 w-full" />
            <Skeleton className="size-12 w-full" />
            <Skeleton className="size-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <IconAlertTriangle {...tablerIconProps('sm')} className="text-destructive" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => fetchExpenses()} className="flex items-center gap-2">
            <IconRefresh {...tablerIconProps('sm')} />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Your Expenses</h1>
        <Button asChild className="group flex items-center gap-2">
          <Link to="/add-expense">
            <IconPlus {...tablerIconProps('sm')} />
            Add New Expense
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-md border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto flex-1 max-w-sm">
            <IconSearch {...tablerIconProps('sm')} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search expenses..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 self-end">
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={() => fetchExpenses()}>
              <IconRefresh {...tablerIconProps('sm')} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" variant="outline" className="h-9 gap-1">
              <IconFilter {...tablerIconProps('sm')} />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>
        
        {sortedAndFilteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <svg
                className="h-10 w-10 text-muted-foreground"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 5H3M21 19H3M8 12h8M12 16V8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">No expenses found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchTerm ? 'No expenses match your search criteria.' : 'You haven\'t recorded any expenses yet. Add one to get started!'}
            </p>
            <Button asChild>
              <Link to="/add-expense">Add Your First Expense</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <button 
                      className="flex items-center gap-1 hover:text-[hsl(var(--foreground))]"
                      onClick={() => requestSort('name')}
                    >
                      Name
                      <IconArrowsUpDown {...tablerIconProps('sm')} className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center gap-1 hover:text-[hsl(var(--foreground))]"
                      onClick={() => requestSort('category')}
                    >
                      Category
                      <IconArrowsUpDown {...tablerIconProps('sm')} className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center gap-1 ml-auto hover:text-[hsl(var(--foreground))]"
                      onClick={() => requestSort('amount')}
                    >
                      Amount
                      <IconArrowsUpDown {...tablerIconProps('sm')} className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center gap-1 hover:text-[hsl(var(--foreground))]"
                      onClick={() => requestSort('date')}
                    >
                      Date
                      <IconArrowsUpDown {...tablerIconProps('sm')} className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="group">
                    <TableCell className="font-medium">
                      {expense.name}
                      {(expense.isPlaceholder || expense.id.startsWith('placeholder-') || expense.id.startsWith('recovered-')) && (
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                          Placeholder
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {expense.category || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link to={`/expenses/${expense.id}`}>
                            <IconEye {...tablerIconProps('sm')} className="size-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link to={`/edit-expense/${expense.id}`}>
                            <IconPencil {...tablerIconProps('sm')} className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Dialog open={dialogOpen && deleteItemId === expense.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) setDeleteItemId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-[hsl(var(--foreground))]"
                              onClick={() => setDeleteItemId(expense.id)}
                            >
                              <IconTrash {...tablerIconProps('sm')} className="size-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete expense "{expense.name}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleDelete(expense.id)}
                                disabled={deleteLoading && deleteItemId === expense.id}
                              >
                                {deleteLoading && deleteItemId === expense.id ? (
                                  <>
                                    <IconSpinner {...tablerIconProps('sm')} className="mr-2 size-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="px-4 py-3 border-t text-sm text-muted-foreground">
          Showing {sortedAndFilteredExpenses.length} out of {expenses.length} expenses
        </div>
      </div>

      {placeholderCount > 0 && (
        <Alert className="mt-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <AlertTitle className="text-amber-800 dark:text-amber-400">Placeholder Data</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            You have {placeholderCount} placeholder expense(s) in your data. These are temporary items created during data recovery.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Icon component for the spinner
const IconSpinner = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);

export default ExpenseList;
