import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Helper component for icons to apply consistent styling
const FeatureIcon = ({ icon: Icon }) => (
  <Icon className="h-8 w-8 text-primary" />
);
export const statsData = [
  {
    value: "50K+",
    label: "Active Users",
  },
  {
    value: "100K+",
    label: "Transactions Tracked",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.9/5",
    label: "User Rating",
  },
];

export const featuresData = [
  {
    icon: <FeatureIcon icon={BarChart3} />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <FeatureIcon icon={Receipt} />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <FeatureIcon icon={PieChart} />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <FeatureIcon icon={CreditCard} />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <FeatureIcon icon={Globe} />,
    title: "Multi-Currency",
    description: "Support for multiple currencies with real-time conversion",
  },
  {
    icon: <FeatureIcon icon={Zap} />,
    title: "Automated Insights",
    description: "Get automated financial insights and recommendations",
  },
];

export const howItWorksData = [
  {
    icon: <FeatureIcon icon={CreditCard} />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <FeatureIcon icon={BarChart3} />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <FeatureIcon icon={PieChart} />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
];

export const testimonialsData = [
  {
    name: "Sara Brahma",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "ExpTrack has transformed how I manage my business finances. The multi-currency support and detailed analytics are game-changers.",
  },
  {
    name: "Avinaba Ghosh",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The receipt scanning feature saves me hours each month. It's incredibly accurate and makes tax season so much easier.",
  },
  {
    name: "Preyoshi Mondal",
    role: "Student",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "I finally feel in control of my budget. The intelligent planning and automated insights helped me save money faster than I thought possible.",
  },
  {
    name: "Samik Bhattacharya",
    role: "Financial Advisor",
    image: "https://randomuser.me/api/portraits/men/74.jpg",
    quote:
      "I recommend ExpTrack to all my clients. It's a powerful, all-in-one tool that simplifies complex financial management.",
  },
];