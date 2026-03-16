import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { StarIcon } from "lucide-react";
import { CategoryType, ExpenseType } from "@/types";

export default function ExpenseCard({
  expense,
  category,
}: {
  expense: ExpenseType;
  category: CategoryType;
}) {
  return (
    <Link href={`/products/${expense.id}`}>
      <Card className="group card-hover hover:bg-primary-foreground/10 border-solid border-gray-400 min-h-50">
        <CardHeader className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {expense.title}
                </CardTitle>
                {expense.isRecurring && (
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    <StarIcon className="size-3 fill-current" />
                    Recurring
                  </Badge>
                )}
              </div>
              <CardDescription>{expense.description}</CardDescription>
            </div>
          </div>
          <h1>Amount: {expense.amount}</h1>
        </CardHeader>
        <CardFooter>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{category.name}</Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
