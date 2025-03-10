import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nodeTypeIcons: Record<string, { icon: string; color: string }> = {
  // Triggers
  trigger: { icon: "ri-time-line", color: "bg-blue-100 text-blue-600" },
  webhook: { icon: "ri-webhook-line", color: "bg-purple-100 text-purple-600" },
  manual: { icon: "ri-user-line", color: "bg-blue-100 text-blue-600" },
  api_trigger: { icon: "ri-api-line", color: "bg-blue-100 text-blue-600" },
  
  // Logic
  condition: { icon: "ri-git-branch-line", color: "bg-orange-100 text-orange-600" },
  loop: { icon: "ri-loop-left-line", color: "bg-orange-100 text-orange-600" },
  switch: { icon: "ri-switch-line", color: "bg-orange-100 text-orange-600" },
  
  // Services & Integrations
  email: { icon: "ri-mail-line", color: "bg-blue-100 text-blue-600" },
  database: { icon: "ri-database-2-line", color: "bg-green-100 text-green-600" },
  slack: { icon: "ri-slack-line", color: "bg-purple-100 text-purple-600" },
  telegram: { icon: "ri-telegram-line", color: "bg-blue-100 text-blue-600" },
  github: { icon: "ri-github-fill", color: "bg-gray-900 text-white" },
  jira: { icon: "ri-jira-line", color: "bg-blue-500 text-white" },
  
  // API & Data
  api_call: { icon: "ri-api-line", color: "bg-green-100 text-green-600" },
  transform: { icon: "ri-tools-line", color: "bg-blue-100 text-blue-600" },
  json: { icon: "ri-braces-line", color: "bg-green-100 text-green-600" },
  
  // Cloud Services
  s3: { icon: "ri-amazon-line", color: "bg-yellow-100 text-yellow-800" },
  google_sheets: { icon: "ri-file-excel-2-line", color: "bg-green-300 text-green-800" },
  stripe: { icon: "ri-bank-card-line", color: "bg-purple-100 text-purple-800" },
};

export const generateNodeId = () => `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const nodeCategories = [
  {
    name: "Triggers",
    items: [
      { type: "trigger", subtype: "schedule", name: "Schedule", icon: "ri-time-line", color: "blue" },
      { type: "trigger", subtype: "webhook", name: "Webhook", icon: "ri-webhook-line", color: "purple" },
      { type: "trigger", subtype: "manual", name: "Manual", icon: "ri-user-line", color: "blue" },
      { type: "trigger", subtype: "api", name: "API", icon: "ri-api-line", color: "blue" }
    ]
  },
  {
    name: "Logic",
    items: [
      { type: "logic", subtype: "condition", name: "IF Condition", icon: "ri-git-branch-line", color: "orange" },
      { type: "logic", subtype: "switch", name: "Switch", icon: "ri-switch-line", color: "orange" },
      { type: "logic", subtype: "loop", name: "Loop", icon: "ri-loop-left-line", color: "orange" },
      { type: "logic", subtype: "delay", name: "Delay", icon: "ri-time-line", color: "orange" }
    ]
  },
  {
    name: "API & Data",
    items: [
      { type: "action", subtype: "api_call", name: "API Call", icon: "ri-api-line", color: "green" },
      { type: "action", subtype: "transform", name: "Transform", icon: "ri-tools-line", color: "blue" },
      { type: "action", subtype: "json", name: "JSON", icon: "ri-braces-line", color: "green" },
      { type: "action", subtype: "database", name: "Database", icon: "ri-database-2-line", color: "green" }
    ]
  },
  {
    name: "Communication",
    items: [
      { type: "action", subtype: "email", name: "Email", icon: "ri-mail-line", color: "blue" },
      { type: "action", subtype: "slack", name: "Slack", icon: "ri-slack-line", color: "purple" },
      { type: "action", subtype: "telegram", name: "Telegram", icon: "ri-telegram-line", color: "blue" }
    ]
  },
  {
    name: "Project Tools",
    items: [
      { type: "action", subtype: "github", name: "GitHub", icon: "ri-github-fill", color: "gray" },
      { type: "action", subtype: "jira", name: "Jira", icon: "ri-jira-line", color: "blue" },
      { type: "action", subtype: "trello", name: "Trello", icon: "ri-trello-line", color: "blue" }
    ]
  },
  {
    name: "Cloud Services",
    items: [
      { type: "action", subtype: "s3", name: "AWS S3", icon: "ri-amazon-line", color: "yellow" },
      { type: "action", subtype: "google_sheets", name: "Google Sheets", icon: "ri-file-excel-2-line", color: "green" },
      { type: "action", subtype: "stripe", name: "Stripe", icon: "ri-bank-card-line", color: "purple" }
    ]
  }
];

export const getColorForNodeType = (type: string, subtype: string): string => {
  const category = nodeCategories.find(category => 
    category.items.some(item => item.type === type && item.subtype === subtype)
  );
  
  if (!category) return "blue";
  
  const item = category.items.find(item => item.type === type && item.subtype === subtype);
  return item?.color || "blue";
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
