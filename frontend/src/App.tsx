import { SidebarFull} from "@/SidebarFull"
import { useState, useEffect } from "react";
import { DashboardNotLogged } from "@/DashboardNotLogged"
import { DashboardLogged } from "@/DashboardLogged"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Route, Routes } from "react-router"

import { AllJobs } from "@/AllJobs"
import { CreateJob } from "@/CreateJob"

function LoggedIn() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "20rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <SidebarFull />

      <SidebarInset>
        <Routes>
          <Route path="/" element={<DashboardLogged />} />
          <Route path="/jobs" element={<AllJobs />} />
          <Route path="/jobs/create" element={<CreateJob />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function App() {
  const [isLogged, setIsLogged] = useState(false);
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/me");
        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLogged(false);
        return null;
    }
  };
  

  useEffect(() => {
    const getUserData = async () => {
        const userData = await fetchUserData();
        if (userData) {
            setIsLogged(true);
        }
    };
    getUserData();
  }, []);

  return (
    isLogged ? <LoggedIn /> : <DashboardNotLogged />
  )
}

export default App
