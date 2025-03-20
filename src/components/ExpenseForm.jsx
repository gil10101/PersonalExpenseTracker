import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createExpense, getExpense, updateExpense } from '../utils/expenseAPI';
import { useAuth } from '../utils/AuthContext';
import { toast } from "sonner";

// Import shadcn components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Create schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.string().min(1, { message: "Date is required" }),
});

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  
  // Predefined categories
  const categories = [
    'Food', 
    'Transportation', 
    'Housing', 
    'Entertainment', 
    'Utilities', 
    'Healthcare', 
    'Education', 
    'Shopping', 
    'Personal', 
    'Other'
  ];

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    },
  });

  // Fetch expense data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchExpense();
    }
  }, [id]);

  // Function to fetch expense data
  const fetchExpense = async () => {
    try {
      setFetchLoading(true);
      const expense = await getExpense(id);
      
      // Reset form with fetched expense data
      form.reset({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date.split('T')[0] // Format date correctly
      });
      
      setFetchLoading(false);
    } catch (err) {
      console.error('Error fetching expense:', err);
      toast.error('Failed to load expense details. Please try again.');
      setFetchLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    
    try {
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount), // Convert to number
        userId: user.id
      };
      
      if (isEditMode) {
        await updateExpense(id, expenseData);
        toast.success('Expense updated successfully!');
      } else {
        await createExpense(expenseData);
        toast.success('Expense added successfully!');
        form.reset({
          name: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      // Redirect after a delay to show success message
      setTimeout(() => {
        navigate('/expenses');
      }, 1500);
    } catch (err) {
      console.error('Error saving expense:', err);
      toast.error(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full size-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <Card className="max-w-2xl mx-auto shadow-sm border-[hsl(var(--border))]/40 overflow-hidden bg-card">
        <CardHeader className="space-y-1 border-b bg-muted/30 pb-6">
          <div className="flex items-center space-x-2">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">$</span>
            </div>
            <CardTitle className="text-2xl">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
          </div>
          <CardDescription>
            {isEditMode 
              ? 'Update your expense information below' 
              : 'Fill in the details to add a new expense to your tracker'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Expense Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter expense name" 
                        {...field} 
                        className="border-input focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-destructive mt-1" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00"
                          className="pl-7 border-input focus:border-primary focus-visible:ring-1 focus-visible:ring-primary" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-destructive mt-1" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-input focus:border-primary focus-visible:ring-1 focus-visible:ring-primary">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium text-destructive mt-1" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="border-input focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-destructive mt-1" />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/expenses')}
                  className="sm:order-1 border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="sm:order-2 relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Add Expense'}
                  </span>
                  <span className="absolute inset-0 bg-primary-foreground/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;
