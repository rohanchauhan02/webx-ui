# Orchestrator - Visual Workflow Automation Platform

Orchestrator is a powerful workflow automation platform with a visual designer, rule engine, and intelligent recommendations. Build, connect, and automate workflows with ease.

<div align="center">
  <img src="https://github.com/yourusername/orchestrator/raw/main/docs/images/screenshot.png" alt="Orchestrator Screenshot" width="800">
</div>

## Features

- 🔄 **Visual Workflow Builder** - Drag-and-drop interface for creating complex workflows
- 🧠 **Intelligent Recommendations** - Get suggestions based on your workflow patterns
- ⚙️ **Rule Engine** - Define business rules that control your workflow execution
- 🔌 **Extensive Node Library** - Connect to popular services like Slack, Email, Databases, and more
- 📊 **Execution History** - Track and monitor workflow executions
- 🔗 **API Integration** - Trigger workflows via webhooks and API calls
- 📅 **Scheduling** - Run workflows on a schedule

## Quick Start

### Prerequisites

- Node.js 20.x or later
- NPM 9.x or later

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/orchestrator.git
cd orchestrator
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm run dev
```

4. Open your browser and navigate to:

```
http://localhost:5000
```

## Architecture

Orchestrator is built with a modern tech stack:

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Visualization**: ReactFlow
- **Rule Engine**: json-rules-engine
- **Scheduling**: node-cron

## Project Structure

```
orchestrator/
├── client/             # Frontend code
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── pages/      # Page components
├── server/             # Backend code
│   ├── services/       # Business logic
│   │   ├── integrations/ # Service integrations
│   │   ├── ruleEngine.ts # Rule engine
│   │   └── workflowExecutor.ts # Workflow execution
│   ├── index.ts        # Server entry point
│   └── routes.ts       # API routes
└── shared/             # Shared types and utilities
    └── schema.ts       # Database schema and types
```

## Workflow Builder

The workflow builder allows you to create complex automations:

1. **Add Nodes** - Click the "+" button to add nodes to your workflow
2. **Connect Nodes** - Drag from a node's output to another node's input
3. **Configure Nodes** - Click on a node to configure its settings
4. **Save & Run** - Save your workflow and run it

## Node Types

Orchestrator includes a wide variety of node types:

- **Triggers**: Manual, Webhook, Schedule, Database Events
- **Logic**: Conditions, Switches, Loops, Delay
- **API & Data**: HTTP Requests, Database Operations, Transformations
- **Communication**: Email, Slack, Telegram
- **Project Tools**: GitHub, Jira, Trello

## Rule Engine

The rule engine allows you to define business rules that control workflow execution:

1. Navigate to the "Rule Engine" tab in the workflow editor
2. Select a node from the canvas to define rules
3. Create conditions and actions
4. Save your rules

## Recommendations

Orchestrator provides intelligent recommendations based on your workflow:

1. Navigate to the "Recommendations" tab in the workflow editor
2. Browse recommended templates and patterns
3. Apply a recommendation to your workflow

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.