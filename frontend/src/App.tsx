import { Navigate, Route, Routes } from "react-router-dom";
import { appNavigation } from "./config/navigation";
import { AppShell } from "./layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { InboxPage } from "./pages/InboxPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<Navigate replace to="/dashboard" />} index />
        <Route element={<DashboardPage />} path="dashboard" />
        <Route element={<InboxPage />} path="inbox" />
        <Route element={<ProjectsPage />} path="projects" />
        <Route element={<ProjectDetailPage />} path="projects/:projectId" />
        {appNavigation
          .filter((item) => !["/dashboard", "/inbox", "/projects"].includes(item.path))
          .map((item) => (
            <Route
              element={<PlaceholderPage page={item} />}
              key={item.path}
              path={item.path.slice(1)}
            />
          ))}
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
