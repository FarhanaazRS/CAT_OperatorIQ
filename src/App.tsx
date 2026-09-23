import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import CommandCenter from './pages/CommandCenter';
import Tasks        from './pages/Tasks';
import Safety       from './pages/Safety';
import Machine      from './pages/Machine';
import AIInsights   from './pages/AIInsights';
import Training     from './pages/Training';
import ShiftReport  from './pages/ShiftReport';
import OperatorView from './pages/OperatorView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index           element={<CommandCenter />} />
          <Route path="tasks"         element={<Tasks />}         />
          <Route path="safety"        element={<Safety />}        />
          <Route path="machine"       element={<Machine />}       />
          <Route path="insights"      element={<AIInsights />}    />
          <Route path="training"      element={<Training />}      />
          <Route path="shift-report"  element={<ShiftReport />}   />
          <Route path="operator"      element={<OperatorView />}  />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
