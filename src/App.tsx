import Sidebar from "./components/sidebar/Sidebar";
import { SidebarProvider } from "./providers/SidebarProvider";
import Navigation from "./components/navigation/Navigation";
import { SearchProvider } from "./providers/SearchProvider";
import Section from "./components/section/Section";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <SearchProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="lg:pl-72">
              {/* Header */}
              <Navigation />

              {/* Main content */}
              <main className="pt-16 pb-10">
                <Section />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </SearchProvider>
    </ErrorBoundary>
  );
}
