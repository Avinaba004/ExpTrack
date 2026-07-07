import { checkUser } from "@/lib/checkUser";
import { InvestmentDashboard } from "@/features/investment/components/InvestmentDashboard";
import { MarketHighlights } from "@/features/investment/components/MarketHighlights";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, LineChart } from "lucide-react";

export default async function InvestmentPage() {
  await checkUser();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Growth Engine</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Investment Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time analysis and projection of your financial growth.</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Main Dashboard Area */}
        <div className="md:col-span-3">
          <InvestmentDashboard />
        </div>

        {/* Market Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <MarketHighlights />
          {/* Investment Tools Deck */}
          <div className="p-5 border border-primary/10 rounded-2xl bg-gradient-to-b from-primary/5 via-card to-card backdrop-blur-sm shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">AI Research Deck</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore portfolios, query allocations, or match financial vehicles.
            </p>

            <div className="space-y-2.5 flex flex-col pt-1">
              <a href="/investment/chat" className="w-full">
                <Button className="w-full text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 h-auto gap-1.5 shadow-sm">
                  <Bot className="h-3.5 w-3.5" /> AI Chat Assistant
                </Button>
              </a>
              
              <a href="/investment/compare" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/40 py-2.5 h-auto gap-1.5">
                  <LineChart className="h-3.5 w-3.5" /> Compare Options
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
