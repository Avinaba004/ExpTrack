import { PrismaClient } from '@prisma/client';
import { detectIntent } from '../lib/ai/intentDetector';
import { processQuery } from '../lib/ai/queryProcessor';

const prisma = new PrismaClient();

export const handleChatbotQuery = async (userQuestion: string) => {
    const intent = detectIntent(userQuestion);
    
    let response;

    switch (intent) {
        case 'totalSpend':
            response = await processQuery.getTotalSpend(prisma);
            break;
        case 'categoryTotals':
            response = await processQuery.getCategoryTotals(prisma);
            break;
        case 'highestSpendingCategory':
            response = await processQuery.getHighestSpendingCategory(prisma);
            break;
        case 'monthComparison':
            response = await processQuery.compareMonth(prisma);
            break;
        default:
            response = "I'm sorry, I didn't understand your question.";
    }

    return response;
};