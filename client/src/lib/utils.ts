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
  delay: { icon: "ri-time-line", color: "bg-orange-100 text-orange-600" },
  
  // Services & Integrations
  email: { icon: "ri-mail-line", color: "bg-blue-100 text-blue-600" },
  database: { icon: "ri-database-2-line", color: "bg-green-100 text-green-600" },
  slack: { icon: "ri-slack-line", color: "bg-purple-100 text-purple-600" },
  telegram: { icon: "ri-telegram-line", color: "bg-blue-100 text-blue-600" },
  discord: { icon: "ri-discord-line", color: "bg-indigo-100 text-indigo-600" },
  whatsapp: { icon: "ri-whatsapp-line", color: "bg-green-100 text-green-600" },
  sms: { icon: "ri-message-2-line", color: "bg-blue-100 text-blue-600" },
  push_notification: { icon: "ri-notification-3-line", color: "bg-red-100 text-red-600" },
  
  // Project Tools
  github: { icon: "ri-github-fill", color: "bg-gray-900 text-white" },
  gitlab: { icon: "ri-gitlab-fill", color: "bg-orange-100 text-orange-600" },
  bitbucket: { icon: "ri-cloud-line", color: "bg-blue-100 text-blue-600" },
  jira: { icon: "ri-jira-line", color: "bg-blue-500 text-white" },
  trello: { icon: "ri-trello-line", color: "bg-blue-100 text-blue-600" },
  asana: { icon: "ri-task-line", color: "bg-red-100 text-red-600" },
  clickup: { icon: "ri-checkbox-circle-line", color: "bg-purple-100 text-purple-600" },
  
  // API & Data
  api_call: { icon: "ri-api-line", color: "bg-green-100 text-green-600" },
  rest_api: { icon: "ri-global-line", color: "bg-green-100 text-green-600" },
  graphql: { icon: "ri-code-box-line", color: "bg-pink-100 text-pink-600" },
  transform: { icon: "ri-tools-line", color: "bg-blue-100 text-blue-600" },
  json: { icon: "ri-braces-line", color: "bg-green-100 text-green-600" },
  xml: { icon: "ri-file-code-line", color: "bg-blue-100 text-blue-600" },
  csv: { icon: "ri-file-excel-line", color: "bg-green-100 text-green-600" },
  
  // Cloud Services
  aws: { icon: "ri-amazon-line", color: "bg-yellow-100 text-yellow-800" },
  s3: { icon: "ri-folder-upload-line", color: "bg-yellow-100 text-yellow-800" },
  lambda: { icon: "ri-code-s-slash-line", color: "bg-yellow-100 text-yellow-800" },
  dynamodb: { icon: "ri-database-2-line", color: "bg-yellow-100 text-yellow-800" },
  google_sheets: { icon: "ri-file-excel-2-line", color: "bg-green-300 text-green-800" },
  google_drive: { icon: "ri-drive-line", color: "bg-blue-100 text-blue-600" },
  google_calendar: { icon: "ri-calendar-line", color: "bg-blue-100 text-blue-600" },
  dropbox: { icon: "ri-dropbox-line", color: "bg-blue-100 text-blue-600" },
  onedrive: { icon: "ri-microsoft-line", color: "bg-blue-100 text-blue-600" },
  box: { icon: "ri-file-line", color: "bg-blue-100 text-blue-600" },
  
  // Payments & Commerce
  stripe: { icon: "ri-bank-card-line", color: "bg-purple-100 text-purple-800" },
  paypal: { icon: "ri-paypal-line", color: "bg-blue-100 text-blue-600" },
  shopify: { icon: "ri-shopping-bag-line", color: "bg-green-100 text-green-600" },
  woocommerce: { icon: "ri-shopping-cart-line", color: "bg-purple-100 text-purple-600" },
  square: { icon: "ri-wallet-3-line", color: "bg-gray-800 text-white" },
  
  // CRM & Marketing
  salesforce: { icon: "ri-customer-service-2-line", color: "bg-blue-100 text-blue-600" },
  hubspot: { icon: "ri-group-line", color: "bg-orange-100 text-orange-600" },
  mailchimp: { icon: "ri-mail-send-line", color: "bg-yellow-100 text-yellow-800" },
  sendgrid: { icon: "ri-mail-line", color: "bg-blue-100 text-blue-600" },
  airtable: { icon: "ri-table-line", color: "bg-green-100 text-green-600" },
  
  // Social Media
  twitter: { icon: "ri-twitter-x-line", color: "bg-gray-900 text-white" },
  facebook: { icon: "ri-facebook-line", color: "bg-blue-600 text-white" },
  instagram: { icon: "ri-instagram-line", color: "bg-pink-100 text-pink-600" },
  linkedin: { icon: "ri-linkedin-line", color: "bg-blue-100 text-blue-600" },
  youtube: { icon: "ri-youtube-line", color: "bg-red-100 text-red-600" },
  
  // AI & ML
  openai: { icon: "ri-openai-fill", color: "bg-green-100 text-green-600" },
  bing_ai: { icon: "ri-microsoft-line", color: "bg-blue-100 text-blue-600" },
  google_ai: { icon: "ri-google-line", color: "bg-amber-100 text-amber-600" },
  huggingface: { icon: "ri-emotion-happy-line", color: "bg-yellow-100 text-yellow-600" },
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
      { type: "action", subtype: "rest_api", name: "REST API", icon: "ri-global-line", color: "green" },
      { type: "action", subtype: "graphql", name: "GraphQL", icon: "ri-code-box-line", color: "pink" },
      { type: "action", subtype: "transform", name: "Transform", icon: "ri-tools-line", color: "blue" },
      { type: "action", subtype: "json", name: "JSON", icon: "ri-braces-line", color: "green" },
      { type: "action", subtype: "xml", name: "XML", icon: "ri-file-code-line", color: "blue" },
      { type: "action", subtype: "csv", name: "CSV", icon: "ri-file-excel-line", color: "green" },
      { type: "action", subtype: "database", name: "Database", icon: "ri-database-2-line", color: "green" }
    ]
  },
  {
    name: "Communication",
    items: [
      { type: "action", subtype: "email", name: "Email", icon: "ri-mail-line", color: "blue" },
      { type: "action", subtype: "slack", name: "Slack", icon: "ri-slack-line", color: "purple" },
      { type: "action", subtype: "telegram", name: "Telegram", icon: "ri-telegram-line", color: "blue" },
      { type: "action", subtype: "discord", name: "Discord", icon: "ri-discord-line", color: "indigo" },
      { type: "action", subtype: "whatsapp", name: "WhatsApp", icon: "ri-whatsapp-line", color: "green" },
      { type: "action", subtype: "sms", name: "SMS", icon: "ri-message-2-line", color: "blue" },
      { type: "action", subtype: "push_notification", name: "Push Notification", icon: "ri-notification-3-line", color: "red" }
    ]
  },
  {
    name: "Project Tools",
    items: [
      { type: "action", subtype: "github", name: "GitHub", icon: "ri-github-fill", color: "gray" },
      { type: "action", subtype: "gitlab", name: "GitLab", icon: "ri-gitlab-fill", color: "orange" },
      { type: "action", subtype: "bitbucket", name: "Bitbucket", icon: "ri-cloud-line", color: "blue" },
      { type: "action", subtype: "jira", name: "Jira", icon: "ri-jira-line", color: "blue" },
      { type: "action", subtype: "trello", name: "Trello", icon: "ri-trello-line", color: "blue" },
      { type: "action", subtype: "asana", name: "Asana", icon: "ri-task-line", color: "red" },
      { type: "action", subtype: "clickup", name: "ClickUp", icon: "ri-checkbox-circle-line", color: "purple" }
    ]
  },
  {
    name: "Cloud Services",
    items: [
      { type: "action", subtype: "s3", name: "AWS S3", icon: "ri-folder-upload-line", color: "yellow" },
      { type: "action", subtype: "lambda", name: "AWS Lambda", icon: "ri-code-s-slash-line", color: "yellow" },
      { type: "action", subtype: "dynamodb", name: "AWS DynamoDB", icon: "ri-database-2-line", color: "yellow" },
      { type: "action", subtype: "google_sheets", name: "Google Sheets", icon: "ri-file-excel-2-line", color: "green" },
      { type: "action", subtype: "google_drive", name: "Google Drive", icon: "ri-drive-line", color: "blue" },
      { type: "action", subtype: "google_calendar", name: "Google Calendar", icon: "ri-calendar-line", color: "blue" },
      { type: "action", subtype: "dropbox", name: "Dropbox", icon: "ri-dropbox-line", color: "blue" },
      { type: "action", subtype: "onedrive", name: "OneDrive", icon: "ri-microsoft-line", color: "blue" }
    ]
  },
  {
    name: "Payments & Commerce",
    items: [
      { type: "action", subtype: "stripe", name: "Stripe", icon: "ri-bank-card-line", color: "purple" },
      { type: "action", subtype: "paypal", name: "PayPal", icon: "ri-paypal-line", color: "blue" },
      { type: "action", subtype: "shopify", name: "Shopify", icon: "ri-shopping-bag-line", color: "green" },
      { type: "action", subtype: "woocommerce", name: "WooCommerce", icon: "ri-shopping-cart-line", color: "purple" },
      { type: "action", subtype: "square", name: "Square", icon: "ri-wallet-3-line", color: "gray" }
    ]
  },
  {
    name: "CRM & Marketing",
    items: [
      { type: "action", subtype: "salesforce", name: "Salesforce", icon: "ri-customer-service-2-line", color: "blue" },
      { type: "action", subtype: "hubspot", name: "HubSpot", icon: "ri-group-line", color: "orange" },
      { type: "action", subtype: "mailchimp", name: "Mailchimp", icon: "ri-mail-send-line", color: "yellow" },
      { type: "action", subtype: "sendgrid", name: "SendGrid", icon: "ri-mail-line", color: "blue" },
      { type: "action", subtype: "airtable", name: "Airtable", icon: "ri-table-line", color: "green" }
    ]
  },
  {
    name: "Social Media",
    items: [
      { type: "action", subtype: "twitter", name: "Twitter", icon: "ri-twitter-x-line", color: "gray" },
      { type: "action", subtype: "facebook", name: "Facebook", icon: "ri-facebook-line", color: "blue" },
      { type: "action", subtype: "instagram", name: "Instagram", icon: "ri-instagram-line", color: "pink" },
      { type: "action", subtype: "linkedin", name: "LinkedIn", icon: "ri-linkedin-line", color: "blue" },
      { type: "action", subtype: "youtube", name: "YouTube", icon: "ri-youtube-line", color: "red" }
    ]
  },
  {
    name: "AI & ML",
    items: [
      { type: "action", subtype: "openai", name: "OpenAI", icon: "ri-openai-fill", color: "green" },
      { type: "action", subtype: "bing_ai", name: "Bing AI", icon: "ri-microsoft-line", color: "blue" },
      { type: "action", subtype: "google_ai", name: "Google AI", icon: "ri-google-line", color: "amber" },
      { type: "action", subtype: "huggingface", name: "Hugging Face", icon: "ri-emotion-happy-line", color: "yellow" }
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
