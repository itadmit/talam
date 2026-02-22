"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Mail, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { requestOtp, verifyOtp } from "@/actions/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDevCode(null);

    const formData = new FormData();
    formData.set("email", email);

    const result = await requestOtp(formData);
    setLoading(false);

    if (result.ok) {
      toast.success("קוד נשלח למייל שלך");
      setStep("otp");
      if (result.data?.devCode) setDevCode(result.data.devCode);
    } else {
      toast.error(result.error || "שגיאה בשליחת הקוד");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", code);

    const result = await verifyOtp(formData);
    setLoading(false);

    if (result.ok) {
      toast.success("התחברת בהצלחה!");
      router.push("/");
      router.refresh();
    } else {
      toast.error(result.error || "קוד שגוי");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">תל״מ Pro</h1>
          <p className="text-muted-foreground">פורטל ידע ופעולות לקצינים</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {step === "email" ? "כניסה למערכת" : "אימות קוד"}
            </CardTitle>
            <CardDescription>
              {step === "email"
                ? "הזן את כתובת המייל המאושרת שלך"
                : `קוד אימות נשלח ל-${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">כתובת מייל</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10 text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  שלח קוד אימות
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">קוד אימות</Label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pr-10 text-center text-2xl tracking-[0.5em] font-mono"
                      dir="ltr"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading || code.length < 6}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  אמת וכנס
                </Button>
                {devCode && (
                  <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-center font-mono text-lg tracking-widest text-amber-700 dark:text-amber-400">
                    קוד לפיתוח: <strong>{devCode}</strong>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setDevCode(null);
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                  חזור
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          המערכת מיועדת למשתמשים מורשים בלבד | פותח על ידי יוגב אביטן
        </p>
      </div>
    </div>
  );
}
