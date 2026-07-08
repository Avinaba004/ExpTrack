import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
  Sparkles,
  BellRing,
  Bot,
  TrendingUp,
  ShieldCheck,
  CircleDollarSign,
  Landmark,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Clock3,
} from "lucide-react";

const FeatureIcon = ({ icon: Icon }) => <Icon className="h-6 w-6" />;

export const statsData = [
  { value: "50K+", label: "Active users" },
  { value: "100K+", label: "Transactions tracked" },
  { value: "99.9%", label: "Reliability" },
  { value: "4.9/5", label: "User rating" },
];

export const featuresData = [
  {
    icon: <FeatureIcon icon={BarChart3} />,
    title: "Live financial analytics",
    description: "See spending trends, monthly progress, and cashflow in a beautifully simple overview.",
  },
  {
    icon: <FeatureIcon icon={Receipt} />,
    title: "AI receipt scanning",
    description: "Transform receipts into structured transactions in seconds with intelligent extraction.",
  },
  {
    icon: <FeatureIcon icon={PieChart} />,
    title: "Budget automation",
    description: "Set limits, monitor progress, and receive alerts before the month slips away.",
  },
  {
    icon: <FeatureIcon icon={CreditCard} />,
    title: "Multi-account control",
    description: "Bring cards, accounts, and personal finance data into one calm workspace.",
  },
  {
    icon: <FeatureIcon icon={Globe} />,
    title: "Multi-currency ready",
    description: "Stay on top of global expenses with flexible currency support and clear reporting.",
  },
  {
    icon: <FeatureIcon icon={Zap} />,
    title: "Instant insights",
    description: "Get proactive recommendations that help you optimize your next financial move.",
  },
];

export const howItWorksData = [
  {
    icon: <FeatureIcon icon={CreditCard} />,
    title: "1. Create your workspace",
    description: "Set up your account in minutes and connect your spending habits in one place.",
  },
  {
    icon: <FeatureIcon icon={BarChart3} />,
    title: "2. Track as you go",
    description: "Capture transactions, receipts, and budgets without friction or clutter.",
  },
  {
    icon: <FeatureIcon icon={PieChart} />,
    title: "3. Act with confidence",
    description: "Receive smart insights, alerts, and clear progress so your plan always stays on track.",
  },
];

export const highlightCards = [
  {
    title: "Smarter alerts",
    description: "Over-budget moments trigger a polished email reminder so you can respond quickly.",
    icon: <BellRing className="h-5 w-5" />,
  },
  {
    title: "AI assistant ready",
    description: "Ask for help summarizing spending, planning goals, or understanding trends.",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    title: "Investment awareness",
    description: "View your portfolio pulse alongside your everyday spending to stay balanced.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

export const testimonialsData = [
  {
    name: "Sara Brahma",
    role: "Small business owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    quote: "ExpTrack gave me a calm, clear view of my cash flow. I finally feel in control of every month.",
  },
  {
    name: "Avinaba Ghosh",
    role: "Freelancer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    quote: "The receipt scanning and budget alerts save me hours every week. It feels almost effortless.",
  },
  {
    name: "Preyoshi Mondal",
    role: "Student",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    quote: "It made budgeting feel approachable and even motivating. The redesign is beautiful, too.",
  },
  {
    name: "Samik Bhattacharya",
    role: "Financial advisor",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    quote: "I recommend ExpTrack to clients who want a premium experience without sacrificing control.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for getting organized and building your first healthy routine.",
    features: ["Core budget tracking", "AI receipt scanning", "Monthly insights"],
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    description: "For ambitious users who want richer automation and faster decision-making.",
    features: ["Unlimited transactions", "Priority alerts", "Portfolio insights"],
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    description: "Designed for teams and growing financial operations that need flexibility.",
    features: ["Team workflows", "Advanced governance", "Dedicated support"],
    featured: false,
  },
];

export const faqs = [
  {
    question: "Is ExpTrack suitable for personal and business use?",
    answer: "Yes. The product is built for personal budgeting, side hustles, and modern business cashflow tracking.",
  },
  {
    question: "Can I start without connecting every account?",
    answer: "Absolutely. You can begin with manual entries, receipts, and your first budget in minutes.",
  },
  {
    question: "How do the smart alerts work?",
    answer: "When spending approaches or exceeds a budget threshold, ExpTrack can send a timely notification or email.",
  },
];

export const whyExpTrack = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Secure by design" },
  { icon: <Wallet className="h-5 w-5" />, title: "Budget-first workflows" },
  { icon: <Clock3 className="h-5 w-5" />, title: "Save time every week" },
  { icon: <Landmark className="h-5 w-5" />, title: "Built for real-world finance" },
];