"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">שגיאה בטעינת הדף</h2>
          <p className="text-sm text-muted-foreground">
            אירעה שגיאה לא צפויה. נסה לרענן את הדף.
          </p>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            נסה שוב
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
