import "./App.css";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

function App() {
	return (
		<SidebarProvider defaultOpen={true}>
			<AppSidebar />
			<main className="bg-background w-full h-screen">
			</main>
		</SidebarProvider>
	);
}

export default App;
