import { storage } from "../storage";
import type { UserInvestment } from "@shared/schema";

export class InvestmentService {
  // Process daily returns for all active investments
  static async processDailyReturns(): Promise<void> {
    try {
      const investments = await storage.getAllInvestments();
      const activeInvestments = investments.filter(inv => inv.is_active && inv.days_remaining > 0);

      console.log(`Processing daily returns for ${activeInvestments.length} active investments`);

      for (const investment of activeInvestments) {
        const user = await storage.getUser(investment.userId);
        if (!user) continue;

        // Calculate days since investment started (calendar days, not 24-hour periods)
        const now = new Date();
        const investmentStartDate = new Date(investment.created_at);
        
        // Calculate calendar days difference
        const startDate = new Date(investmentStartDate.getFullYear(), investmentStartDate.getMonth(), investmentStartDate.getDate());
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate expected total earnings based on days passed
        const maxDays = 30; // Standard investment duration
        const completedDays = Math.min(daysSinceStart, maxDays);
        const expectedTotalEarnings = completedDays * investment.daily_return;
        
        // Check if user is behind on earnings
        if (expectedTotalEarnings > investment.total_earned) {
          const missingEarnings = expectedTotalEarnings - investment.total_earned;
          
          // Add missing earnings to user balance
          const newBalance = user.balance + missingEarnings;
          await storage.updateUser(investment.userId, { balance: newBalance });

          // Update investment tracking
          const newDaysRemaining = Math.max(0, maxDays - completedDays);
          const updatedInvestment = {
            ...investment,
            total_earned: expectedTotalEarnings,
            days_remaining: newDaysRemaining,
            is_active: newDaysRemaining > 0
          };

          await storage.updateUserInvestment(investment.id, updatedInvestment);

          console.log(`💰 Credited ${user.username}: $${missingEarnings.toFixed(2)} (Day ${completedDays}, Total: $${expectedTotalEarnings.toFixed(2)})`);
        }
      }
    } catch (error) {
      console.error("Error processing daily returns:", error);
    }
  }

  // Manual trigger for testing daily returns (can be called from API for demo purposes)
  static async processDailyReturnsNow(): Promise<{ processed: number; totalCredited: number }> {
    try {
      const investments = await storage.getAllInvestments();
      const activeInvestments = investments.filter(inv => inv.is_active && inv.days_remaining > 0);
      
      let processedCount = 0;
      let totalCredited = 0;

      for (const investment of activeInvestments) {
        const user = await storage.getUser(investment.userId);
        if (!user) continue;

        // Force credit one day's return for demonstration
        const dailyReturn = investment.daily_return;
        const newBalance = user.balance + dailyReturn;
        
        await storage.updateUser(investment.userId, { balance: newBalance });

        const updatedInvestment = {
          ...investment,
          total_earned: investment.total_earned + dailyReturn,
          days_remaining: Math.max(0, investment.days_remaining - 1),
          is_active: investment.days_remaining > 1
        };

        await storage.updateUserInvestment(investment.id, updatedInvestment);

        processedCount++;
        totalCredited += dailyReturn;
        console.log(`Manual credit for ${user.username}: $${dailyReturn.toFixed(2)}`);
      }

      return { processed: processedCount, totalCredited };
    } catch (error) {
      console.error("Error in manual daily returns processing:", error);
      return { processed: 0, totalCredited: 0 };
    }
  }

  // Check if it's 1:00 AM in user's local time
  static isUserLocalTime1AM(userTimezone: string): boolean {
    try {
      const now = new Date();
      const localTime = new Date(now.toLocaleString("en-US", {timeZone: userTimezone}));
      return localTime.getHours() === 1;
    } catch (error) {
      console.error(`Error checking time for timezone ${userTimezone}:`, error);
      return false;
    }
  }

  // Process returns for users where it's 1:00 AM local time
  static async processReturnsForLocalTime(): Promise<void> {
    try {
      const investments = await storage.getAllInvestments();
      const activeInvestments = investments.filter(inv => inv.is_active && inv.days_remaining > 0);
      
      let processedCount = 0;

      for (const investment of activeInvestments) {
        const user = await storage.getUser(investment.userId);
        if (!user || !(user as any).timezone) continue;
        
        // Check if it's 1:00 AM in the user's timezone
        if (InvestmentService.isUserLocalTime1AM((user as any).timezone)) {
          // Check if user already received profit today
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          const lastProfitDate = (investment as any).last_profit_date;
          
          if (lastProfitDate === today) {
            continue; // Already processed today
          }
          
          // Credit daily return
          const dailyReturn = investment.daily_return;
          const newBalance = user.balance + dailyReturn;
          await storage.updateUser(investment.userId, { balance: newBalance });

          // Update investment
          const newDaysRemaining = Math.max(0, investment.days_remaining - 1);
          const updatedInvestment = {
            ...investment,
            total_earned: investment.total_earned + dailyReturn,
            days_remaining: newDaysRemaining,
            is_active: newDaysRemaining > 0,
            last_profit_date: today
          };

          await storage.updateUserInvestment(investment.id, updatedInvestment);
          
          processedCount++;
          console.log(`🕐 1:00 AM Daily Profit for ${user.username} (${(user as any).timezone}): $${dailyReturn.toFixed(2)} - Day ${30 - newDaysRemaining}`);
        }
      }
      
      if (processedCount > 0) {
        console.log(`Processed ${processedCount} users at their local 1:00 AM`);
      }
    } catch (error) {
      console.error("Error processing local time returns:", error);
    }
  }

  // Start the daily return processing service
  static startDailyReturnService(): void {
    // Process timezone-based returns every 15 minutes to catch 1:00 AM for all timezones
    setInterval(async () => {
      await InvestmentService.processReturnsForLocalTime();
    }, 15 * 60 * 1000); // Every 15 minutes

    // Keep the backup catchup processing every 4 hours for any missed payments
    setInterval(async () => {
      await InvestmentService.processDailyReturns();
    }, 4 * 60 * 60 * 1000); // Every 4 hours

    console.log("Daily return service started - timezone-based profits every 15 minutes, catchup every 4 hours");
    
    // Run immediate processing on startup
    setTimeout(async () => {
      console.log("Running initial daily returns processing...");
      await InvestmentService.processReturnsForLocalTime();
      await InvestmentService.processDailyReturns();
    }, 5000); // Wait 5 seconds after startup
  }
}