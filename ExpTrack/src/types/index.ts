export interface Expense {
    id: number;
    amount: number;
    category: string;
    date: Date;
    description?: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface ChatbotResponse {
    intent: string;
    data: any;
    message: string;
}

export interface UserQuery {
    question: string;
    userId: string;
}