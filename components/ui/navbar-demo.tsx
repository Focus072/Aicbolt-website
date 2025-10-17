import { Home, User, Briefcase, FileText, Settings, Activity } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: User },
    { name: 'Projects', url: '/projects', icon: Briefcase },
    { name: 'Resume', url: '/resume', icon: FileText }
  ]

  return <NavBar items={navItems} />
}

export function SaaSNavBar() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Pricing', url: '/pricing', icon: FileText },
    { name: 'Dashboard', url: '/dashboard', icon: Activity },
    { name: 'Settings', url: '/dashboard/general', icon: Settings }
  ]

  return <NavBar items={navItems} />
}
