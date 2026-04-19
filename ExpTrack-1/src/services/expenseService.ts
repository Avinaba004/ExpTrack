import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTotalSpend = async () => {
    const total = await prisma.expense.aggregate({
        _sum: {
            amount: true,
        },
    });
    return total._sum.amount || 0;
};

export const getCategoryTotals = async () => {
    const totals = await prisma.expense.groupBy({
        by: ['category'],
        _sum: {
            amount: true,
        },
    });
    return totals.map(item => ({
        category: item.category,
        total: item._sum.amount || 0,
    }));
};

export const getHighestSpendingCategory = async () => {
    const totals = await getCategoryTotals();
    return totals.reduce((prev, current) => {
        return (prev.total > current.total) ? prev : current;
    }, { category: '', total: 0 });
};

export const getMonthlyComparison = async (month: number, year: number) => {
    const currentMonthTotal = await prisma.expense.aggregate({
        where: {
            createdAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
            },
        },
        _sum: {
            amount: true,
        },
    });

    const lastMonthTotal = await prisma.expense.aggregate({
        where: {
            createdAt: {
                gte: new Date(year, month - 2, 1),
                lt: new Date(year, month - 1, 1),
            },
        },
        _sum: {
            amount: true,
        },
    });

    return {
        currentMonth: currentMonthTotal._sum.amount || 0,
        lastMonth: lastMonthTotal._sum.amount || 0,
    };
};