import { GasExpense } from '@/hooks/useGasExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fuel, Trash2, ImageIcon, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GasExpenseListProps {
  expenses: GasExpense[];
  onDelete: (id: string) => void;
  totalGasSpent: number;
  totalGallons: number;
}

export const GasExpenseList = ({ expenses, onDelete, totalGasSpent, totalGallons }: GasExpenseListProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-accent" />
            Gas Expenses
          </span>
          <span className="text-sm font-medium text-success">
            ${totalGasSpent.toFixed(2)} total
          </span>
        </CardTitle>
        {totalGallons > 0 && (
          <p className="text-xs text-muted-foreground">{totalGallons.toFixed(1)} gallons this month</p>
        )}
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No gas expenses logged this month
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map(expense => (
              <div key={expense.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">${expense.amount.toFixed(2)}</span>
                    {expense.stationName && (
                      <span className="text-sm text-muted-foreground">at {expense.stationName}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
                    {expense.gallons > 0 && <span>{expense.gallons.toFixed(2)} gal</span>}
                    {expense.pricePerGallon > 0 && <span>${expense.pricePerGallon.toFixed(3)}/gal</span>}
                  </div>
                  {expense.notes && <p className="text-xs text-muted-foreground">{expense.notes}</p>}
                  {expense.receiptUrl && (
                    <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ImageIcon className="h-3 w-3" /> View Receipt
                    </a>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(expense.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
