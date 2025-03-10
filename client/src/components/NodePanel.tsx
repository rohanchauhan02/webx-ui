import { useState } from "react";
import { Node } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { nodeCategories } from "@/lib/utils";
import { X, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface NodeData {
  label: string;
  type: string;
  subtype: string;
  icon: string;
  color: string;
  config: Record<string, any>;
}

interface NodePanelProps {
  selectedNode: Node<NodeData> | null;
  onNodeSelect: (node: Node<NodeData> | null) => void;
  onNodeUpdate: (nodeId: string, data: Partial<NodeData>) => void;
}

const NodePanel = ({ selectedNode, onNodeSelect, onNodeUpdate }: NodePanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleConfigChange = (key: string, value: any) => {
    if (!selectedNode) return;
    
    const updatedConfig = {
      ...selectedNode.data.config,
      [key]: value
    };
    
    onNodeUpdate(selectedNode.id, { 
      config: updatedConfig 
    });
  };
  
  const handleLabelChange = (value: string) => {
    if (!selectedNode) return;
    onNodeUpdate(selectedNode.id, { label: value });
  };
  
  const renderNodeLibrary = () => {
    const filteredCategories = nodeCategories.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
    
    return (
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="font-semibold mb-4">Node Library</h3>
        
        <div className="mb-4">
          <div className="bg-gray-100 rounded-md px-3 py-2 flex items-center mb-3">
            <Search className="h-4 w-4 text-gray-500" />
            <Input 
              type="text" 
              placeholder="Search nodes..." 
              className="bg-transparent border-none px-2 py-1 w-full focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredCategories.map((category, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">{category.name}</h4>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className="p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:border-primary cursor-grab flex items-center"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', JSON.stringify(item));
                  }}
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-2 ${
                    item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                    item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    item.color === 'green' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={item.icon}></i>
                  </div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderEmailConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="service">Email Service</Label>
            <Select 
              value={config.service || "smtp"} 
              onValueChange={(value) => handleConfigChange("service", value)}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="Select email service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Input 
              id="recipient" 
              value={config.recipient || ""} 
              onChange={(e) => handleConfigChange("recipient", e.target.value)}
              placeholder="recipient@example.com or {{ data.email }}"
            />
            <p className="text-xs text-gray-500 mt-1">Use {{ }} for dynamic values</p>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              value={config.subject || ""} 
              onChange={(e) => handleConfigChange("subject", e.target.value)}
              placeholder="Email Subject"
            />
          </div>
          
          <div>
            <Label htmlFor="body">Message Body</Label>
            <Textarea 
              id="body" 
              value={config.body || ""} 
              onChange={(e) => handleConfigChange("body", e.target.value)}
              placeholder="Email content..."
              className="h-24"
            />
          </div>
        </div>
      </>
    );
  };
  
  const renderWebhookConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="method">HTTP Method</Label>
            <Select 
              value={config.method || "GET"} 
              onValueChange={(value) => handleConfigChange("method", value)}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="url">Webhook URL</Label>
            <Input 
              id="url" 
              value={config.url || ""} 
              onChange={(e) => handleConfigChange("url", e.target.value)}
              placeholder="https://example.com/webhook"
            />
          </div>
          
          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea 
              id="headers" 
              value={config.headers || "{\n  \"Content-Type\": \"application/json\"\n}"} 
              onChange={(e) => handleConfigChange("headers", e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              className="font-mono text-sm h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="responseMapping">Response Mapping</Label>
            <Input 
              id="responseMapping" 
              value={config.responseMapping || "data.result"} 
              onChange={(e) => handleConfigChange("responseMapping", e.target.value)}
              placeholder="data.result"
            />
            <p className="text-xs text-gray-500 mt-1">Path to extract from response</p>
          </div>
        </div>
      </>
    );
  };
  
  const renderScheduleConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="schedule">Schedule Type</Label>
            <Select 
              value={config.scheduleType || "interval"} 
              onValueChange={(value) => handleConfigChange("scheduleType", value)}
            >
              <SelectTrigger id="schedule">
                <SelectValue placeholder="Select schedule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interval">Interval</SelectItem>
                <SelectItem value="cron">Cron Expression</SelectItem>
                <SelectItem value="fixed">Fixed Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.scheduleType === "interval" && (
            <>
              <div>
                <Label htmlFor="interval">Interval</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="interval" 
                    type="number" 
                    value={config.interval || 5} 
                    onChange={(e) => handleConfigChange("interval", Number(e.target.value))}
                  />
                  <Select 
                    value={config.intervalUnit || "minutes"} 
                    onValueChange={(value) => handleConfigChange("intervalUnit", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          
          {config.scheduleType === "cron" && (
            <div>
              <Label htmlFor="cron">Cron Expression</Label>
              <Input 
                id="cron" 
                value={config.cron || "*/5 * * * *"} 
                onChange={(e) => handleConfigChange("cron", e.target.value)}
                placeholder="*/5 * * * *"
              />
              <p className="text-xs text-gray-500 mt-1">Example: */5 * * * * (every 5 minutes)</p>
            </div>
          )}
          
          {config.scheduleType === "fixed" && (
            <div>
              <Label htmlFor="fixedTime">Fixed Time</Label>
              <Input 
                id="fixedTime" 
                type="datetime-local" 
                value={config.fixedTime || ""} 
                onChange={(e) => handleConfigChange("fixedTime", e.target.value)}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={config.timezone || "UTC"} 
              onValueChange={(value) => handleConfigChange("timezone", value)}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </>
    );
  };
  
  const renderConditionConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Textarea 
              id="condition" 
              value={config.condition || "data.value > 10"} 
              onChange={(e) => handleConfigChange("condition", e.target.value)}
              placeholder="data.value > 10"
              className="h-20"
            />
            <p className="text-xs text-gray-500 mt-1">JavaScript expression that evaluates to true/false</p>
          </div>
          
          <div>
            <Label>Output Branches</Label>
            <div className="text-xs text-gray-500 mt-1 mb-2">The workflow will follow these paths based on the condition result:</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">True - When condition evaluates to true</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm">False - When condition evaluates to false</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  const renderLoopConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="loopType">Loop Type</Label>
            <Select 
              value={config.loopType || "collection"} 
              onValueChange={(value) => handleConfigChange("loopType", value)}
            >
              <SelectTrigger id="loopType">
                <SelectValue placeholder="Select loop type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collection">Collection</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="while">While Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.loopType === "collection" && (
            <div>
              <Label htmlFor="collection">Collection Path</Label>
              <Input 
                id="collection" 
                value={config.collection || "data.items"} 
                onChange={(e) => handleConfigChange("collection", e.target.value)}
                placeholder="data.items"
              />
              <p className="text-xs text-gray-500 mt-1">Path to the array to iterate through</p>
            </div>
          )}
          
          {config.loopType === "count" && (
            <div>
              <Label htmlFor="count">Number of Iterations</Label>
              <Input 
                id="count" 
                type="number" 
                value={config.count || 5} 
                onChange={(e) => handleConfigChange("count", Number(e.target.value))}
              />
            </div>
          )}
          
          {config.loopType === "while" && (
            <div>
              <Label htmlFor="whileCondition">While Condition</Label>
              <Textarea 
                id="whileCondition" 
                value={config.whileCondition || "data.hasMore === true"} 
                onChange={(e) => handleConfigChange("whileCondition", e.target.value)}
                placeholder="data.hasMore === true"
              />
              <p className="text-xs text-gray-500 mt-1">Expression that must evaluate to true to continue looping</p>
            </div>
          )}
          
          <div>
            <Label htmlFor="maxIterations">Maximum Iterations</Label>
            <Input 
              id="maxIterations" 
              type="number" 
              value={config.maxIterations || 100} 
              onChange={(e) => handleConfigChange("maxIterations", Number(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">Safety limit to prevent infinite loops</p>
          </div>
        </div>
      </>
    );
  };

  const renderDatabaseConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="operation">Database Operation</Label>
            <Select 
              value={config.operation || "query"} 
              onValueChange={(value) => handleConfigChange("operation", value)}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="query">Query</SelectItem>
                <SelectItem value="insert">Insert</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="query">SQL Query</Label>
            <Textarea 
              id="query" 
              value={config.query || ""} 
              onChange={(e) => handleConfigChange("query", e.target.value)}
              placeholder="SELECT * FROM users WHERE status = 'active'"
              className="font-mono text-sm h-24"
            />
          </div>
          
          {(config.operation === "insert" || config.operation === "update") && (
            <div>
              <Label htmlFor="params">Parameters (JSON)</Label>
              <Textarea 
                id="params" 
                value={config.params || "{\n  \"name\": \"{{ data.name }}\",\n  \"email\": \"{{ data.email }}\"\n}"}
                onChange={(e) => handleConfigChange("params", e.target.value)}
                placeholder='{"name": "{{ data.name }}", "email": "{{ data.email }}"}'
                className="font-mono text-sm h-24"
              />
            </div>
          )}
        </div>
      </>
    );
  };

  const renderSlackConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Input 
              id="channel" 
              value={config.channel || "#general"} 
              onChange={(e) => handleConfigChange("channel", e.target.value)}
              placeholder="#general or @username"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              value={config.message || ""} 
              onChange={(e) => handleConfigChange("message", e.target.value)}
              placeholder="Your notification message here..."
              className="h-24"
            />
            <p className="text-xs text-gray-500 mt-1">Use {{ }} for dynamic values</p>
          </div>
          
          <div>
            <Label htmlFor="username">Bot Username</Label>
            <Input 
              id="username" 
              value={config.username || "Workflow Bot"} 
              onChange={(e) => handleConfigChange("username", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="icon">Bot Icon</Label>
            <Input 
              id="icon" 
              value={config.icon || ":robot_face:"} 
              onChange={(e) => handleConfigChange("icon", e.target.value)}
              placeholder=":robot_face: or URL"
            />
          </div>
        </div>
      </>
    );
  };
  
  const renderNodeConfig = () => {
    if (!selectedNode) return null;
    
    const renderSpecificConfig = () => {
      const { subtype } = selectedNode.data;
      
      switch (subtype) {
        // Trigger nodes
        case 'schedule': return renderScheduleConfig();
        case 'webhook': return renderWebhookConfig();
        case 'manual': return renderManualTriggerConfig();
        case 'api': return renderApiTriggerConfig();
        
        // Logic nodes
        case 'condition': return renderConditionConfig();
        case 'switch': return defaultConfigMessage();
        case 'loop': return renderLoopConfig();
        case 'delay': return defaultConfigMessage();
        
        // API & Data nodes
        case 'api_call': return renderApiCallConfig();
        case 'transform': return defaultConfigMessage();
        case 'json': return defaultConfigMessage();
        case 'database': return renderDatabaseConfig();
        
        // Communication nodes
        case 'email': return renderEmailConfig();
        case 'slack': return renderSlackConfig();
        case 'telegram': return renderTelegramConfig();
        case 'discord': return renderDiscordConfig();
        case 'whatsapp': return renderWhatsAppConfig();
        case 'sms': return defaultConfigMessage();
        case 'push_notification': return defaultConfigMessage();
        
        // Project Management nodes
        case 'github': return renderGithubConfig();
        case 'gitlab': return defaultConfigMessage();
        case 'bitbucket': return defaultConfigMessage();
        case 'jira': return renderJiraConfig();
        case 'trello': return defaultConfigMessage();
        case 'asana': return defaultConfigMessage();
        case 'clickup': return defaultConfigMessage();
        
        // Cloud Service nodes
        case 's3': return defaultConfigMessage();
        case 'lambda': return defaultConfigMessage();
        case 'dynamodb': return defaultConfigMessage();
        case 'google_sheets': return renderGoogleSheetsConfig();
        case 'google_drive': return defaultConfigMessage();
        case 'google_calendar': return defaultConfigMessage();
        case 'dropbox': return defaultConfigMessage();
        case 'onedrive': return defaultConfigMessage();
        
        // Payments & Commerce nodes
        case 'stripe': return defaultConfigMessage();
        case 'paypal': return defaultConfigMessage();
        case 'shopify': return defaultConfigMessage();
        case 'woocommerce': return defaultConfigMessage();
        case 'square': return defaultConfigMessage();
        
        // CRM & Marketing nodes
        case 'salesforce': return defaultConfigMessage();
        case 'hubspot': return defaultConfigMessage();
        case 'mailchimp': return defaultConfigMessage();
        case 'sendgrid': return defaultConfigMessage();
        case 'airtable': return defaultConfigMessage();
        
        // Social Media nodes
        case 'twitter': return defaultConfigMessage();
        case 'facebook': return defaultConfigMessage();
        case 'instagram': return defaultConfigMessage();
        case 'linkedin': return defaultConfigMessage();
        case 'youtube': return defaultConfigMessage();
        
        // AI & ML nodes
        case 'openai': return renderOpenAIConfig();
        case 'bing_ai': return defaultConfigMessage();
        case 'google_ai': return defaultConfigMessage();
        case 'huggingface': return defaultConfigMessage();
        
        default: return defaultConfigMessage();
      }
    };
    
    const defaultConfigMessage = () => (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md border border-gray-100">
        <p>Configuration for this node type will be available soon.</p>
        <p className="mt-2 text-xs">
          <span className="font-semibold">TODO:</span> Backend integration needed for {selectedNode.data.subtype} node type.
        </p>
      </div>
    );
    
    return (
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Configure Node</h3>
          <Button variant="ghost" size="icon" onClick={() => onNodeSelect(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="nodeName">Node Name</Label>
              <Input 
                id="nodeName" 
                value={selectedNode.data.label} 
                onChange={(e) => handleLabelChange(e.target.value)}
              />
            </div>
            
            <Separator className="my-4" />
            
            {renderSpecificConfig()}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="errorHandling">Error Handling</Label>
              <Select 
                value={selectedNode.data.config?.errorHandling || "abort"} 
                onValueChange={(value) => handleConfigChange("errorHandling", value)}
              >
                <SelectTrigger id="errorHandling">
                  <SelectValue placeholder="Select error handling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abort">Abort workflow on error</SelectItem>
                  <SelectItem value="continue">Continue workflow on error</SelectItem>
                  <SelectItem value="retry">Retry (max 3 times)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input 
                id="timeout" 
                type="number" 
                value={selectedNode.data.config?.timeout || 30} 
                onChange={(e) => handleConfigChange("timeout", Number(e.target.value))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="skipExecution" 
                checked={selectedNode.data.config?.skipExecution || false}
                onChange={(e) => handleConfigChange("skipExecution", e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="skipExecution" className="text-sm cursor-pointer">Skip this node during execution</Label>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // GitHub integration node
  const renderGithubConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="operation">GitHub Operation</Label>
            <Select 
              value={config.operation || "create_issue"} 
              onValueChange={(value) => handleConfigChange("operation", value)}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create_issue">Create Issue</SelectItem>
                <SelectItem value="update_issue">Update Issue</SelectItem>
                <SelectItem value="create_pr">Create Pull Request</SelectItem>
                <SelectItem value="merge_pr">Merge Pull Request</SelectItem>
                <SelectItem value="add_comment">Add Comment</SelectItem>
                <SelectItem value="list_issues">List Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="repository">Repository</Label>
            <Input 
              id="repository" 
              value={config.repository || ""} 
              onChange={(e) => handleConfigChange("repository", e.target.value)}
              placeholder="username/repository"
            />
          </div>
          
          {(config.operation === "create_issue" || config.operation === "update_issue") && (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={config.title || ""} 
                  onChange={(e) => handleConfigChange("title", e.target.value)}
                  placeholder="Issue title"
                />
              </div>
              
              <div>
                <Label htmlFor="body">Description</Label>
                <Textarea 
                  id="body" 
                  value={config.body || ""} 
                  onChange={(e) => handleConfigChange("body", e.target.value)}
                  placeholder="Issue description..."
                  className="h-24"
                />
                <p className="text-xs text-gray-500 mt-1">Markdown supported. Use {{ }} for dynamic values</p>
              </div>
              
              <div>
                <Label htmlFor="labels">Labels</Label>
                <Input 
                  id="labels" 
                  value={config.labels || ""} 
                  onChange={(e) => handleConfigChange("labels", e.target.value)}
                  placeholder="bug, enhancement, etc. (comma separated)"
                />
              </div>
            </>
          )}
          
          {config.operation === "update_issue" && (
            <div>
              <Label htmlFor="issueNumber">Issue Number</Label>
              <Input 
                id="issueNumber" 
                type="number"
                value={config.issueNumber || ""} 
                onChange={(e) => handleConfigChange("issueNumber", Number(e.target.value))}
                placeholder="123"
              />
            </div>
          )}
          
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
            <p>GitHub integration requires authentication.</p>
            <p className="text-xs mt-1">
              <span className="font-semibold">TODO:</span> Backend integration needed for GitHub API calls.
            </p>
          </div>
        </div>
      </>
    );
  };
  
  // Jira integration node
  const renderJiraConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="operation">Jira Operation</Label>
            <Select 
              value={config.operation || "create_issue"} 
              onValueChange={(value) => handleConfigChange("operation", value)}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create_issue">Create Issue</SelectItem>
                <SelectItem value="update_issue">Update Issue</SelectItem>
                <SelectItem value="transition_issue">Transition Issue</SelectItem>
                <SelectItem value="add_comment">Add Comment</SelectItem>
                <SelectItem value="search_issues">Search Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="domain">Jira Domain</Label>
            <Input 
              id="domain" 
              value={config.domain || ""} 
              onChange={(e) => handleConfigChange("domain", e.target.value)}
              placeholder="company.atlassian.net"
            />
          </div>
          
          {(config.operation === "create_issue") && (
            <>
              <div>
                <Label htmlFor="projectKey">Project Key</Label>
                <Input 
                  id="projectKey" 
                  value={config.projectKey || ""} 
                  onChange={(e) => handleConfigChange("projectKey", e.target.value)}
                  placeholder="KEY"
                />
              </div>
              
              <div>
                <Label htmlFor="issueType">Issue Type</Label>
                <Select 
                  value={config.issueType || "Task"} 
                  onValueChange={(value) => handleConfigChange("issueType", value)}
                >
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Input 
                  id="summary" 
                  value={config.summary || ""} 
                  onChange={(e) => handleConfigChange("summary", e.target.value)}
                  placeholder="Issue summary"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={config.description || ""} 
                  onChange={(e) => handleConfigChange("description", e.target.value)}
                  placeholder="Issue description..."
                  className="h-24"
                />
              </div>
            </>
          )}
          
          {(config.operation === "update_issue" || config.operation === "transition_issue" || config.operation === "add_comment") && (
            <div>
              <Label htmlFor="issueKey">Issue Key</Label>
              <Input 
                id="issueKey" 
                value={config.issueKey || ""} 
                onChange={(e) => handleConfigChange("issueKey", e.target.value)}
                placeholder="KEY-123"
              />
            </div>
          )}
          
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
            <p>Jira integration requires authentication.</p>
            <p className="text-xs mt-1">
              <span className="font-semibold">TODO:</span> Backend integration needed for Jira API calls.
            </p>
          </div>
        </div>
      </>
    );
  };
  
  // Telegram integration node
  const renderTelegramConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="chatId">Chat ID</Label>
            <Input 
              id="chatId" 
              value={config.chatId || ""} 
              onChange={(e) => handleConfigChange("chatId", e.target.value)}
              placeholder="Chat ID or @username"
            />
            <p className="text-xs text-gray-500 mt-1">Group ID, Channel ID, or @username</p>
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              value={config.message || ""} 
              onChange={(e) => handleConfigChange("message", e.target.value)}
              placeholder="Message text..."
              className="h-24"
            />
            <p className="text-xs text-gray-500 mt-1">Markdown supported. Use {{ }} for dynamic values</p>
          </div>
          
          <div>
            <Label htmlFor="parseMode">Parse Mode</Label>
            <Select 
              value={config.parseMode || "Markdown"} 
              onValueChange={(value) => handleConfigChange("parseMode", value)}
            >
              <SelectTrigger id="parseMode">
                <SelectValue placeholder="Select parse mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Markdown">Markdown</SelectItem>
                <SelectItem value="HTML">HTML</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
            <p>Telegram integration requires a bot token.</p>
            <p className="text-xs mt-1">
              <span className="font-semibold">TODO:</span> Backend integration needed for Telegram Bot API.
            </p>
          </div>
        </div>
      </>
    );
  };
  
  // Google Sheets integration node
  const renderGoogleSheetsConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="operation">Operation</Label>
            <Select 
              value={config.operation || "read"} 
              onValueChange={(value) => handleConfigChange("operation", value)}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Sheet</SelectItem>
                <SelectItem value="append">Append Row</SelectItem>
                <SelectItem value="update">Update Cell</SelectItem>
                <SelectItem value="create">Create Sheet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
            <Input 
              id="spreadsheetId" 
              value={config.spreadsheetId || ""} 
              onChange={(e) => handleConfigChange("spreadsheetId", e.target.value)}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
            <p className="text-xs text-gray-500 mt-1">ID from Google Sheets URL</p>
          </div>
          
          <div>
            <Label htmlFor="sheetName">Sheet Name</Label>
            <Input 
              id="sheetName" 
              value={config.sheetName || "Sheet1"} 
              onChange={(e) => handleConfigChange("sheetName", e.target.value)}
              placeholder="Sheet1"
            />
          </div>
          
          {config.operation === "append" && (
            <div>
              <Label htmlFor="values">Values</Label>
              <Textarea 
                id="values" 
                value={config.values || "{{ data.values }}"}
                onChange={(e) => handleConfigChange("values", e.target.value)}
                placeholder="JSON array or {{ data.values }}"
                className="h-20"
              />
              <p className="text-xs text-gray-500 mt-1">Array of values or dynamic reference</p>
            </div>
          )}
          
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
            <p>Google Sheets integration requires OAuth authentication.</p>
            <p className="text-xs mt-1">
              <span className="font-semibold">TODO:</span> Backend integration needed for Google Sheets API.
            </p>
          </div>
        </div>
      </>
    );
  };
  
  const renderDiscordConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input 
              id="webhookUrl" 
              value={config.webhookUrl || ""} 
              onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              type="password"
            />
            <p className="text-xs text-gray-500 mt-1">Discord channel webhook URL</p>
          </div>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={config.username || ""} 
              onChange={(e) => handleConfigChange("username", e.target.value)}
              placeholder="Bot Name"
            />
          </div>
          
          <div>
            <Label htmlFor="avatar">Avatar URL (optional)</Label>
            <Input 
              id="avatar" 
              value={config.avatar || ""} 
              onChange={(e) => handleConfigChange("avatar", e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>
          
          <div>
            <Label htmlFor="content">Message Content</Label>
            <Textarea 
              id="content" 
              value={config.content || ""} 
              onChange={(e) => handleConfigChange("content", e.target.value)}
              placeholder="Message to send..."
              className="h-20"
            />
          </div>
          
          <div>
            <Label htmlFor="embedTitle">Embed Title (optional)</Label>
            <Input 
              id="embedTitle" 
              value={config.embedTitle || ""} 
              onChange={(e) => handleConfigChange("embedTitle", e.target.value)}
              placeholder="Embed Title"
            />
          </div>
          
          <div>
            <Label htmlFor="embedDescription">Embed Description (optional)</Label>
            <Textarea 
              id="embedDescription" 
              value={config.embedDescription || ""} 
              onChange={(e) => handleConfigChange("embedDescription", e.target.value)}
              placeholder="Embed description text..."
              className="h-16"
            />
          </div>
          
          <div>
            <Label htmlFor="embedColor">Embed Color (optional)</Label>
            <Input 
              id="embedColor" 
              value={config.embedColor || "#5865F2"} 
              onChange={(e) => handleConfigChange("embedColor", e.target.value)}
              placeholder="#5865F2"
            />
            <p className="text-xs text-gray-500 mt-1">Hex color code for embed</p>
          </div>
        </div>
      </>
    );
  };
  
  const renderWhatsAppConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              id="apiKey" 
              value={config.apiKey || ""} 
              onChange={(e) => handleConfigChange("apiKey", e.target.value)}
              placeholder="Your WhatsApp Business API Key"
              type="password"
            />
          </div>
          
          <div>
            <Label htmlFor="phoneId">Phone Number ID</Label>
            <Input 
              id="phoneId" 
              value={config.phoneId || ""} 
              onChange={(e) => handleConfigChange("phoneId", e.target.value)}
              placeholder="Your registered phone number ID"
            />
          </div>
          
          <div>
            <Label htmlFor="recipient">Recipient Number</Label>
            <Input 
              id="recipient" 
              value={config.recipient || ""} 
              onChange={(e) => handleConfigChange("recipient", e.target.value)}
              placeholder="+1234567890 or {{ data.phone }}"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code, use {{ }} for dynamic values</p>
          </div>
          
          <div>
            <Label htmlFor="messageType">Message Type</Label>
            <Select 
              value={config.messageType || "text"} 
              onValueChange={(value) => handleConfigChange("messageType", value)}
            >
              <SelectTrigger id="messageType">
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="template">Template Message</SelectItem>
                <SelectItem value="media">Media Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.messageType === "text" && (
            <div>
              <Label htmlFor="message">Message Text</Label>
              <Textarea 
                id="message" 
                value={config.message || ""} 
                onChange={(e) => handleConfigChange("message", e.target.value)}
                placeholder="Your message content..."
                className="h-24"
              />
            </div>
          )}
          
          {config.messageType === "template" && (
            <>
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input 
                  id="templateName" 
                  value={config.templateName || ""} 
                  onChange={(e) => handleConfigChange("templateName", e.target.value)}
                  placeholder="your_template_name"
                />
              </div>
              <div>
                <Label htmlFor="templateParameters">Template Parameters (JSON)</Label>
                <Textarea 
                  id="templateParameters" 
                  value={config.templateParameters || "[]"} 
                  onChange={(e) => handleConfigChange("templateParameters", e.target.value)}
                  placeholder='[{"type":"text","text":"Hello there!"}]'
                  className="font-mono text-sm h-24"
                />
              </div>
            </>
          )}
          
          {config.messageType === "media" && (
            <>
              <div>
                <Label htmlFor="mediaType">Media Type</Label>
                <Select 
                  value={config.mediaType || "image"} 
                  onValueChange={(value) => handleConfigChange("mediaType", value)}
                >
                  <SelectTrigger id="mediaType">
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mediaUrl">Media URL</Label>
                <Input 
                  id="mediaUrl" 
                  value={config.mediaUrl || ""} 
                  onChange={(e) => handleConfigChange("mediaUrl", e.target.value)}
                  placeholder="https://example.com/media.jpg"
                />
              </div>
              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input 
                  id="caption" 
                  value={config.caption || ""} 
                  onChange={(e) => handleConfigChange("caption", e.target.value)}
                  placeholder="Image description"
                />
              </div>
            </>
          )}
        </div>
      </>
    );
  };
  
  const renderOpenAIConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              id="apiKey" 
              value={config.apiKey || ""} 
              onChange={(e) => handleConfigChange("apiKey", e.target.value)}
              placeholder="Your OpenAI API Key"
              type="password"
            />
          </div>
          
          <div>
            <Label htmlFor="model">Model</Label>
            <Select 
              value={config.model || "gpt-4-turbo"} 
              onValueChange={(value) => handleConfigChange("model", value)}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="text-davinci-003">Davinci</SelectItem>
                <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="requestType">Request Type</Label>
            <Select 
              value={config.requestType || "completion"} 
              onValueChange={(value) => handleConfigChange("requestType", value)}
            >
              <SelectTrigger id="requestType">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Text Completion</SelectItem>
                <SelectItem value="chat">Chat Completion</SelectItem>
                <SelectItem value="image">Image Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(config.requestType === "completion" || config.requestType === "chat") && (
            <>
              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea 
                  id="prompt" 
                  value={config.prompt || ""} 
                  onChange={(e) => handleConfigChange("prompt", e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="h-24"
                />
                <p className="text-xs text-gray-500 mt-1">Use {`{${'{'}data.variable}`} for dynamic content</p>
              </div>
              
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center">
                  <Input 
                    id="temperature" 
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature || 0.7} 
                    onChange={(e) => handleConfigChange("temperature", Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="ml-2 text-sm font-mono">{config.temperature || 0.7}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Lower for deterministic results, higher for creativity</p>
              </div>
              
              <div>
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input 
                  id="maxTokens" 
                  type="number" 
                  value={config.maxTokens || 500} 
                  onChange={(e) => handleConfigChange("maxTokens", Number(e.target.value))}
                />
              </div>
            </>
          )}
          
          {config.requestType === "image" && (
            <>
              <div>
                <Label htmlFor="imagePrompt">Image Prompt</Label>
                <Textarea 
                  id="imagePrompt" 
                  value={config.imagePrompt || ""} 
                  onChange={(e) => handleConfigChange("imagePrompt", e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="h-24"
                />
              </div>
              
              <div>
                <Label htmlFor="imageSize">Image Size</Label>
                <Select 
                  value={config.imageSize || "1024x1024"} 
                  onValueChange={(value) => handleConfigChange("imageSize", value)}
                >
                  <SelectTrigger id="imageSize">
                    <SelectValue placeholder="Select image size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256x256">256x256</SelectItem>
                    <SelectItem value="512x512">512x512</SelectItem>
                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                    <SelectItem value="1792x1024">1792x1024 (landscape)</SelectItem>
                    <SelectItem value="1024x1792">1024x1792 (portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="imageQuality">Image Quality</Label>
                <Select 
                  value={config.imageQuality || "standard"} 
                  onValueChange={(value) => handleConfigChange("imageQuality", value)}
                >
                  <SelectTrigger id="imageQuality">
                    <SelectValue placeholder="Select image quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="outputMapping">Output Mapping</Label>
            <Input 
              id="outputMapping" 
              value={config.outputMapping || "response"} 
              onChange={(e) => handleConfigChange("outputMapping", e.target.value)}
              placeholder="response"
            />
            <p className="text-xs text-gray-500 mt-1">Variable name to store the output</p>
          </div>
        </div>
      </>
    );
  };
  
  const renderManualTriggerConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="triggerName">Trigger Name</Label>
            <Input 
              id="triggerName" 
              value={config.triggerName || ""} 
              onChange={(e) => handleConfigChange("triggerName", e.target.value)}
              placeholder="My Manual Trigger"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={config.description || ""} 
              onChange={(e) => handleConfigChange("description", e.target.value)}
              placeholder="Description of what this trigger does..."
              className="h-20"
            />
          </div>
          
          <div>
            <Label htmlFor="inputs">Input Parameters (JSON)</Label>
            <Textarea 
              id="inputs" 
              value={config.inputs || "[]"} 
              onChange={(e) => handleConfigChange("inputs", e.target.value)}
              placeholder='[{"name":"email","type":"string","required":true}]'
              className="font-mono text-sm h-24"
            />
            <p className="text-xs text-gray-500 mt-1">Define parameters that must be provided when triggered</p>
          </div>
        </div>
      </>
    );
  };
  
  const renderApiTriggerConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="endpointPath">Endpoint Path</Label>
            <Input 
              id="endpointPath" 
              value={config.endpointPath || ""} 
              onChange={(e) => handleConfigChange("endpointPath", e.target.value)}
              placeholder="/api/trigger/my-endpoint"
            />
            <p className="text-xs text-gray-500 mt-1">API path to trigger this workflow</p>
          </div>
          
          <div>
            <Label htmlFor="method">HTTP Method</Label>
            <Select 
              value={config.method || "POST"} 
              onValueChange={(value) => handleConfigChange("method", value)}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="authentication">Authentication</Label>
            <Select 
              value={config.authentication || "none"} 
              onValueChange={(value) => handleConfigChange("authentication", value)}
            >
              <SelectTrigger id="authentication">
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="apiKey">API Key</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.authentication === "apiKey" && (
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input 
                id="apiKey" 
                value={config.apiKey || ""} 
                onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                placeholder="Your API key"
                type="password"
              />
            </div>
          )}
          
          {config.authentication === "bearer" && (
            <div>
              <Label htmlFor="bearerToken">Bearer Token</Label>
              <Input 
                id="bearerToken" 
                value={config.bearerToken || ""} 
                onChange={(e) => handleConfigChange("bearerToken", e.target.value)}
                placeholder="Your bearer token"
                type="password"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="requestSchema">Request Schema (JSON)</Label>
            <Textarea 
              id="requestSchema" 
              value={config.requestSchema || "{}"} 
              onChange={(e) => handleConfigChange("requestSchema", e.target.value)}
              placeholder='{"type":"object","properties":{"name":{"type":"string"}}}'
              className="font-mono text-sm h-24"
            />
            <p className="text-xs text-gray-500 mt-1">JSON Schema for validating incoming requests</p>
          </div>
        </div>
      </>
    );
  };
  
  const renderApiCallConfig = () => {
    const config = selectedNode?.data.config || {};
    
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input 
              id="url" 
              value={config.url || ""} 
              onChange={(e) => handleConfigChange("url", e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
          </div>
          
          <div>
            <Label htmlFor="method">Method</Label>
            <Select 
              value={config.method || "GET"} 
              onValueChange={(value) => handleConfigChange("method", value)}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea 
              id="headers" 
              value={config.headers || "{\n  \"Content-Type\": \"application/json\"\n}"} 
              onChange={(e) => handleConfigChange("headers", e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              className="font-mono text-sm h-20"
            />
          </div>
          
          {(config.method === "POST" || config.method === "PUT" || config.method === "PATCH") && (
            <div>
              <Label htmlFor="body">Request Body (JSON)</Label>
              <Textarea 
                id="body" 
                value={config.body || "{}"} 
                onChange={(e) => handleConfigChange("body", e.target.value)}
                placeholder='{"key": "value"}'
                className="font-mono text-sm h-24"
              />
              <p className="text-xs text-gray-500 mt-1">Use {`{${'{'}data.variable}`} for dynamic values</p>
            </div>
          )}
          
          <div>
            <Label htmlFor="auth">Authentication</Label>
            <Select 
              value={config.auth || "none"} 
              onValueChange={(value) => handleConfigChange("auth", value)}
            >
              <SelectTrigger id="auth">
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="apiKey">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.auth === "basic" && (
            <>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={config.username || ""} 
                  onChange={(e) => handleConfigChange("username", e.target.value)}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  value={config.password || ""} 
                  onChange={(e) => handleConfigChange("password", e.target.value)}
                  placeholder="Password"
                  type="password"
                />
              </div>
            </>
          )}
          
          {config.auth === "bearer" && (
            <div>
              <Label htmlFor="token">Bearer Token</Label>
              <Input 
                id="token" 
                value={config.token || ""} 
                onChange={(e) => handleConfigChange("token", e.target.value)}
                placeholder="Bearer token"
                type="password"
              />
            </div>
          )}
          
          {config.auth === "apiKey" && (
            <>
              <div>
                <Label htmlFor="apiKeyName">API Key Name</Label>
                <Input 
                  id="apiKeyName" 
                  value={config.apiKeyName || ""} 
                  onChange={(e) => handleConfigChange("apiKeyName", e.target.value)}
                  placeholder="X-API-Key"
                />
              </div>
              <div>
                <Label htmlFor="apiKeyValue">API Key Value</Label>
                <Input 
                  id="apiKeyValue" 
                  value={config.apiKeyValue || ""} 
                  onChange={(e) => handleConfigChange("apiKeyValue", e.target.value)}
                  placeholder="your-api-key"
                  type="password"
                />
              </div>
              <div>
                <Label htmlFor="apiKeyPlacement">API Key Placement</Label>
                <Select 
                  value={config.apiKeyPlacement || "header"} 
                  onValueChange={(value) => handleConfigChange("apiKeyPlacement", value)}
                >
                  <SelectTrigger id="apiKeyPlacement">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="query">Query Parameter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="responseMapping">Response Mapping</Label>
            <Input 
              id="responseMapping" 
              value={config.responseMapping || "data"} 
              onChange={(e) => handleConfigChange("responseMapping", e.target.value)}
              placeholder="data"
            />
            <p className="text-xs text-gray-500 mt-1">Path to extract from response (e.g., data.results)</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto flex flex-col h-full">
      {selectedNode ? renderNodeConfig() : renderNodeLibrary()}
    </div>
  );
};

export default NodePanel;
