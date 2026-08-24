import { Sidebar, SidebarFooter, SidebarContent, SidebarHeader, SidebarMenuItem, SidebarMenuButton, SidebarMenu} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {Avatar,AvatarFallback,AvatarImage,} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {Item,ItemActions,ItemContent,ItemMedia,ItemTitle,} from "@/components/ui/item"
import { useEffect, useState } from "react"
import { House, BriefcaseBusiness } from "lucide-react"
import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar"
import { Link } from "react-router"
function ItemAvatar() {
    const [showItem, setShowItem] = useState(false);
    const [name, setName] = useState("Loading...");
    const [avatarUrl, setAvatarUrl] = useState("https://github.com/evilrabbit.png");
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
            setShowItem(false);
            return null;
        }
    };

    useEffect(() => {
        const getUserData = async () => {
            const userData = await fetchUserData();
            if (userData) {
                setShowItem(true);
                setName(userData.name);
                setAvatarUrl(userData.picture);
            }
        };

        getUserData();
    }, []);
    if (!showItem) {
        return null
    }
    return (
        <div className="flex w-full max-w-lg flex-col gap-6">
        <Item variant="outline">
            <ItemMedia>
            <Avatar className="size-10">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>ER</AvatarFallback>
            </Avatar>
            </ItemMedia>
            <ItemContent>
            <ItemTitle>{name}</ItemTitle>
            </ItemContent>
            <ItemActions>
            <Button size="sm" variant="outline" onClick={() => {
                window.location.href = "/logout"
            }}>
                Logout
            </Button>
            </ItemActions>
        </Item>
        </div>
    )
}
    



export function SidebarFull() {
  return (
        <Sidebar>
          <SidebarHeader>
             <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-12 px-4 text-center text-base [&>svg]:size-5" render={<SidebarMenuButton />}>
                  Monte Carlo π Computing Platform
                </DropdownMenuTrigger>
              </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton className="h-12 px-4 text-base [&>svg]:size-5" render={<Link to="/" />}>
                    <House />
                    <span>Home</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton className="h-12 px-4 text-base [&>svg]:size-5">
                    <BriefcaseBusiness />
                    <span>Jobs</span>
                    </SidebarMenuButton>

                    <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton render={<Link to="/jobs/create" />}>
                        <span>Create Job</span>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton render={<Link to="/jobs" />}>
                        <span>All Jobs</span>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </SidebarMenuItem>
                </SidebarMenu>
          </SidebarHeader>
          <SidebarContent />




          <SidebarFooter>
            <SidebarMenu>
               <ItemAvatar />
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar> 
  )
}

export default SidebarFull
