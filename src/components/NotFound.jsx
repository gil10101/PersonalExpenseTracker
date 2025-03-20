import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from '@tabler/icons-react';
import { Card, CardContent } from "@/components/ui/card";
import { tablerIconProps } from '../utils/iconUtils';

const NotFound = () => {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 max-w-7xl mx-auto">
      <Card className="w-full max-w-[600px] shadow-md border-[hsl(var(--border))]/30 overflow-hidden bg-card/90">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-destructive/10 p-6 mb-8 animate-pulse">
              <IconAlertTriangle {...tablerIconProps('xl')} className="text-destructive/80" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-destructive/80 to-destructive/50 text-transparent bg-clip-text">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground max-w-[400px] mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Please check the URL or navigate back to the dashboard.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="relative overflow-hidden transition-all duration-300 group"
            >
              <Link to="/" className="flex items-center gap-2">
                <span className="relative z-10">Return to Dashboard</span>
                <span className="relative size-5 rounded-full flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-primary-foreground/20 animate-ping"></span>
                  →
                </span>
                <span className="absolute inset-0 bg-primary-foreground/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound; 