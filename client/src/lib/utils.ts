import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nodeTypeIcons: Record<string, { icon: string; color: string }> = {
  trigger: { icon: "ri-time-line", color: "bg-blue-100 text-blue-600" },
  webhook: { icon: "ri-webhook-line", color: "bg-purple-100 text-purple-600" },
  condition: { icon: "ri-git-branch-line", color: "bg-orange-100 text-orange-600" },
  loop: { icon: "ri-loop-left-line", color: "bg-orange-100 text-orange-600" },
  email: { icon: "ri-mail-line", color: "bg-blue-100 text-blue-600" },
  database: { icon: "ri-database-2-line", color: "bg-green-100 text-green-600" },
  slack: { icon: "ri-slack-line", color: "bg-purple-100 text-purple-600" },
};

export const generateNodeId = () => `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const nodeCategories = [
  {
    name: "Triggers",
    items: [
      { type: "trigger", subtype: "schedule", name: "Schedule", icon: "ri-time-line", color: "blue" },
      { type: "trigger", subtype: "webhook", name: "Webhook", icon: "ri-webhook-line", color: "purple" }
    ]
  },
  {
    name: "Logic",
    items: [
      { type: "logic", subtype: "condition", name: "IF Condition", icon: "ri-git-branch-line", color: "orange" },
      { type: "logic", subtype: "loop", name: "Loop", icon: "ri-loop-left-line", color: "orange" }
    ]
  },
  {
    name: "Services",
    items: [
      { type: "action", subtype: "email", name: "Email", icon: "ri-mail-line", color: "blue" },
      { type: "action", subtype: "database", name: "Database", icon: "ri-database-2-line", color: "green" },
      { type: "action", subtype: "slack", name: "Slack", icon: "ri-slack-line", color: "purple" }
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
