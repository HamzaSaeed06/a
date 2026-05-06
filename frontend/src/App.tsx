import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginPage from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import TeamsPage from "./pages/admin/Teams";
import PlayersPage from "./pages/admin/Players";
import PoolPage from "./pages/admin/Pool";
import LiveAuctionPage from "./pages/admin/LiveAuction";
import FranchisePage from "./pages/franchise/Dashboard";
import CompetitorsPage from "./pages/franchise/Competitors";
import FranchisePoolPage from "./pages/franchise/Pool";
import FranchiseLiveAuction from "./pages/franchise/LiveAuction";
import FranchiseProfilePage from "./pages/franchise/Profile";
import SuperAdminPage from "./pages/super-admin/Overview";
import UsersPage from "./pages/super-admin/Users";
import CategoriesPage from "./pages/super-admin/Categories";
import CountriesPage from "./pages/super-admin/Countries";
import SeasonsPage from "./pages/super-admin/Seasons";

function RedirectByRole() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  if (user.role === "Super Admin") return <Redirect to="/super-admin" />;
  if (user.role === "Admin") return <Redirect to="/admin" />;
  if (user.role === "Franchise") return <Redirect to="/franchise" />;
  return <Redirect to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={RedirectByRole} />

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/teams" component={TeamsPage} />
      <Route path="/admin/players" component={PlayersPage} />
      <Route path="/admin/pool" component={PoolPage} />
      <Route path="/admin/live-auction" component={LiveAuctionPage} />

      <Route path="/franchise" component={FranchisePage} />
      <Route path="/franchise/competitors" component={CompetitorsPage} />
      <Route path="/franchise/pool" component={FranchisePoolPage} />
      <Route path="/franchise/live-auction" component={FranchiseLiveAuction} />
      <Route path="/franchise/profile" component={FranchiseProfilePage} />

      <Route path="/super-admin" component={SuperAdminPage} />
      <Route path="/super-admin/users" component={UsersPage} />
      <Route path="/super-admin/categories" component={CategoriesPage} />
      <Route path="/super-admin/countries" component={CountriesPage} />
      <Route path="/super-admin/seasons" component={SeasonsPage} />

      <Route>{() => <Redirect to="/" />}</Route>
    </Switch>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <WouterRouter base={base}>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-center" toastOptions={{ 
          style: { 
            fontSize: "14px", 
            fontWeight: 500, 
            borderRadius: "12px", 
            padding: "12px 16px",
            background: "#fff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)"
          },
          success: {
            iconTheme: { primary: "#059669", secondary: "#fff" }
          },
          error: {
            iconTheme: { primary: "#dc2626", secondary: "#fff" }
          }
        }} />
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
