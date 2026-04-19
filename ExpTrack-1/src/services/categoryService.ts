import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHighestSpendingCategory = async () => {
    const categories = await prisma.expense.groupBy({
        by: ['category'],
        _sum: {
            amount: true,
        },
        orderBy: {
            _sum: {
                amount: 'desc',
            },
        },
        take: 1,
    });

    return categories[0] || null;
};

export const getCategoryTotals = async () => {
    const categoryTotals = await prisma.expense.groupBy({
        by: ['category'],
        _sum: {
            amount: true,
        },
    });

    return categoryTotals;
};