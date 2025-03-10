import fetch from 'node-fetch';

interface WebhookRequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface WebhookHandler {
  path: string;
  handler: (req: any, res: any) => void;
}

// Store for webhook handlers
const webhookHandlers: WebhookHandler[] = [];

/**
 * Make a webhook request to an external service
 * @param options Request options including URL, method, headers, and body
 * @returns Object with the result of the operation
 */
export async function makeWebhookRequest(options: WebhookRequestOptions): Promise<Record<string, any>> {
  try {
    if (!options.url) {
      return {
        success: false,
        message: "URL is required",
        status: "failed"
      };
    }
    
    const method = options.method?.toUpperCase() || 'GET';
    const headers = options.headers || {};
    
    // Add default content-type for JSON if not specified
    if (options.body && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Build request options
    const requestOptions: any = {
      method,
      headers,
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && options.body) {
      requestOptions.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }
    
    console.log(`Making ${method} request to ${options.url}`);
    
    // Make the request
    const response = await fetch(options.url, requestOptions);
    
    // Parse response
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    console.error(`Error making webhook request to ${options.url}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      status: "error"
    };
  }
}

/**
 * Register a webhook handler for incoming requests
 * @param path Path to listen for webhook requests
 * @param handler Function to handle incoming webhook requests
 */
export function registerWebhookHandler(path: string, handler: (req: any, res: any) => void): void {
  webhookHandlers.push({ path, handler });
  console.log(`Registered webhook handler for path: ${path}`);
}

/**
 * Setup webhook routes in the Express app
 * @param app Express application
 */
export function setupWebhooks(app: any): void {
  // Create a base path for all incoming webhooks
  app.post('/webhook/:name', (req: any, res: any) => {
    const webhookName = req.params.name;
    const fullPath = `/webhook/${webhookName}`;
    
    console.log(`Received webhook request to ${fullPath}`);
    
    // Find handler for this webhook
    const handler = webhookHandlers.find(h => h.path === fullPath);
    
    if (handler) {
      handler.handler(req, res);
    } else {
      // Default handler for workflows
      // In a real implementation, this would look up a workflow to trigger
      console.log(`No handler found for webhook ${fullPath}`);
      res.status(200).json({
        message: `Webhook received successfully`,
        path: fullPath,
        timestamp: new Date().toISOString(),
        data: req.body
      });
    }
  });
  
  console.log('Webhook routes initialized');
}
