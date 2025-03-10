import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import WorkflowEditor from "@/pages/workflow-editor";
import ExecutionHistory from "@/pages/execution-history";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflows/:id" component={WorkflowEditor} />
      <Route path="/workflows/new" component={WorkflowEditor} />
      <Route path="/history" component={ExecutionHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
