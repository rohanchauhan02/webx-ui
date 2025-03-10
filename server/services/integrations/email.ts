interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  service?: string;
  from?: string;
}

/**
 * Send an email using the specified service
 * @param options Email options including recipient, subject, and body
 * @returns Object with the result of the operation
 */
export async function sendEmail(options: EmailOptions): Promise<Record<string, any>> {
  console.log(`Sending email to ${options.to} using ${options.service || 'default'} service`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body preview: ${options.body.substring(0, 50)}...`);
  
  // This is a simplified mock implementation
  // In a real application, this would connect to an email service
  
  // Validate email address format
  if (!validateEmail(options.to)) {
    return {
      success: false,
      message: "Invalid email address",
      status: "failed"
    };
  }
  
  // Simulate different email services
  switch (options.service?.toLowerCase()) {
    case 'gmail':
      // Gmail-specific implementation would go here
      return mockEmailResponse('gmail');
    
    case 'sendgrid':
      // SendGrid-specific implementation would go here
      return mockEmailResponse('sendgrid');
    
    case 'smtp':
    default:
      // Default SMTP implementation would go here
      return mockEmailResponse('smtp');
  }
}

/**
 * Validate an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if the email is valid
 */
function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Generate a mock email response for demo purposes
 * @param service Email service used
 * @returns Mock response object
 */
function mockEmailResponse(service: string): Record<string, any> {
  // Generate a random message ID
  const messageId = `<${Date.now()}.${Math.floor(Math.random() * 1000000)}@${service}.example.com>`;
  
  return {
    success: true,
    message: "Email sent successfully",
    messageId,
    service,
    timestamp: new Date().toISOString(),
    status: "sent"
  };
}
