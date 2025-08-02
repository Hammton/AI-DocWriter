import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WorkflowNavigation } from './components/WorkflowNavigation';
import { DomainSelection } from './pages/DomainSelection';
import { TemplateSelection } from './pages/TemplateSelection';
import { InputForm } from './pages/InputForm';
import { DataSourceSelection } from './pages/DataSourceSelection';
import ReportGeneration from './pages/ReportGeneration';
import ReportPreview from './pages/ReportPreview';
import { useWorkflowStore } from './stores/workflowStore';

function App() {
  const { currentStep, completedSteps } = useWorkflowStore();

  return (
    <Router>
      <Layout>
        <WorkflowNavigation 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />
        
        <Routes>
          <Route path="/" element={<DomainSelection />} />
          <Route path="/template-selection" element={<TemplateSelection />} />
          <Route path="/input-form" element={<InputForm />} />
          <Route path="/data-source" element={<DataSourceSelection />} />
          <Route path="/generate-report" element={<ReportGeneration />} />
          <Route path="/reports/:sessionId" element={<ReportPreview />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
