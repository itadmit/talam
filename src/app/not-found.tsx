import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">הדף לא נמצא</h2>
          <p className="text-muted-foreground">
            הדף שחיפשת לא קיים או שהוסר.
          </p>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              חזרה לדף הבית
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
