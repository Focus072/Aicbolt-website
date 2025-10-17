"use client";

import { SessionNavBar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, DollarSign, User, Clock, Target, Settings, FolderOpen, Bot, Zap, Database, BarChart3, Users, FileText, ShoppingCart, Wrench, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProjectStatus = "Planning" | "In Progress" | "Deployed" | "Paused" | "Completed";

interface Project {
  id: number;
  name: string;
  description: string;
  projectType: string;
  status: ProjectStatus;
  stack: string;
  monthlyRoi: number;
  budget: number;
  assignedTo: string;
  clientId?: number;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  progressPercentage: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalRoi: number;
  averageProgress: number;
}

const PROJECT_TYPE_ICONS = {
  "Voice AI Agents": Bot,
  "Automation Workflows": Zap,
  "Data Extraction & Parsing": Database,
  "Dashboards & Analytics": BarChart3,
  "CRM / Lead Automation": Users,
  "Property Management Bots": FileText,
  "Accounting / Invoice Automation": DollarSign,
  "E-commerce & Wholesale Automation": ShoppingCart,
  "Internal AI Assistants": Wrench,
  "Custom Integrations": Settings,
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "Planning":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Deployed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Paused":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    case "Completed":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 60) return "bg-yellow-500";
  if (percentage >= 40) return "bg-blue-500";
  return "bg-red-500";
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Array<{id: number, name: string}>>([]);

  // Fetch projects data
  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        const [projectsResponse, analyticsResponse, clientsResponse] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/analytics"),
          fetch("/api/clients"),
        ]);

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        } else {
          const errorData = await projectsResponse.json();
          console.error("Failed to fetch projects:", projectsResponse.status, errorData);
          alert(`Failed to fetch projects: ${errorData.error || 'Unknown error'}\n\nDetails: ${errorData.details || 'No details'}`);
          setProjects([]);
        }

        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData.map((client: any) => ({ id: client.id, name: client.name })));
        }

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics({
            totalProjects: analyticsData.analytics?.projectCount || 0,
            activeProjects: analyticsData.analytics?.activeProjects || 0,
            completedProjects: analyticsData.analytics?.completedProjects || 0,
            totalBudget: analyticsData.analytics?.totalBudget || 0,
            totalRoi: analyticsData.analytics?.totalRoi || 0,
            averageProgress: analyticsData.analytics?.averageProgress || 0,
          });
        } else {
          const errorData = await analyticsResponse.json();
          console.error("Failed to fetch analytics:", analyticsResponse.status, errorData);
          alert(`Failed to fetch analytics: ${errorData.error || 'Unknown error'}\n\nDetails: ${errorData.details || 'No details'}`);
          setAnalytics({
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            totalBudget: 0,
            totalRoi: 0,
            averageProgress: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        alert(`Error fetching project data: ${error instanceof Error ? error.message : String(error)}`);
        setProjects([]);
        setAnalytics({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalBudget: 0,
          totalRoi: 0,
          averageProgress: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsData();
  }, []);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.assignedTo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.clientName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.projectType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handler functions
  const handleAddProject = () => {
    setShowAddForm(true);
    setEditingProject(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowAddForm(true);
  };

  const handleViewProject = (project: Project) => {
    setEditingProject(project);
    setShowAddForm(true);
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      // Validate ID before making request
      if (!projectId || isNaN(projectId) || projectId <= 0) {
        alert('Invalid project ID. Cannot delete.');
        return;
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (response.ok) {
        setProjects(projects.filter((project) => project.id !== projectId));
      } else {
        const errorMessage = responseData?.error || "Failed to delete project";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project. Please try again.");
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProject(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      console.log("Sending data:", formData);
      console.log("URL:", url);
      console.log("Method:", method);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        const updatedProject = responseData;

        if (editingProject) {
          setProjects(
            projects.map((project) =>
              project.id === editingProject.id ? updatedProject : project
            )
          );
        } else {
          setProjects([...projects, updatedProject]);
        }

        handleCloseForm();
      } else {
        const errorMessage =
          responseData?.error ||
          `Failed to ${editingProject ? "update" : "add"} project`;
        alert(`${errorMessage}. Please try again.`);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert(
        `Error ${editingProject ? "updating" : "adding"} project. Please try again.`
      );
    }
  };

  // Project Form Component
  const ProjectForm = () => {
    // Helper function to format date for input field
    const formatDateForInput = (date: string | null | undefined) => {
      if (!date) return "";
      try {
        const dateObj = new Date(date);
        return dateObj.toISOString().split('T')[0];
      } catch {
        return "";
      }
    };

    const [formData, setFormData] = useState({
      name: editingProject?.name || "",
      description: editingProject?.description || "",
      projectType: editingProject?.projectType || "Voice AI Agents",
      status: editingProject?.status || "Planning",
      stack: editingProject?.stack || "",
      monthlyRoi: editingProject?.monthlyRoi || 0,
      budget: editingProject?.budget || 0,
      assignedTo: editingProject?.assignedTo || "",
      clientId: editingProject?.clientId?.toString() || "",
      startDate: formatDateForInput(editingProject?.startDate),
      endDate: formatDateForInput(editingProject?.endDate),
      progressPercentage: editingProject?.progressPercentage || 0,
      notes: editingProject?.notes || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleFormSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingProject ? "Project Details" : "Add New Project"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="AI Voice Assistant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type *</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) =>
                      setFormData({ ...formData, projectType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    <option value="Voice AI Agents">Voice AI Agents</option>
                    <option value="Automation Workflows">Automation Workflows</option>
                    <option value="Data Extraction & Parsing">Data Extraction & Parsing</option>
                    <option value="Dashboards & Analytics">Dashboards & Analytics</option>
                    <option value="CRM / Lead Automation">CRM / Lead Automation</option>
                    <option value="Property Management Bots">Property Management Bots</option>
                    <option value="Accounting / Invoice Automation">Accounting / Invoice Automation</option>
                    <option value="E-commerce & Wholesale Automation">E-commerce & Wholesale Automation</option>
                    <option value="Internal AI Assistants">Internal AI Assistants</option>
                    <option value="Custom Integrations">Custom Integrations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the project goals and requirements..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Deployed">Deployed</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Progress (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progressPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progressPercentage: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assigned To</label>
                  <Input
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    placeholder="Developer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Stack</label>
                  <Input
                    value={formData.stack}
                    onChange={(e) =>
                      setFormData({ ...formData, stack: e.target.value })
                    }
                    placeholder="Vapi, n8n, Airtable, Twilio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    <option value="">No client assigned</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly ROI ($)</label>
                  <Input
                    type="number"
                    value={formData.monthlyRoi / 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyRoi: parseFloat(e.target.value) * 100 || 0,
                      })
                    }
                    placeholder="500.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget ($)</label>
                  <Input
                    type="number"
                    value={formData.budget / 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: parseFloat(e.target.value) * 100 || 0,
                      })
                    }
                    placeholder="5000.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional project notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingProject ? "Save Changes" : "Add Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <SessionNavBar />
        <div className="flex-1 flex items-center justify-center ml-12 lg:ml-60 transition-all duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <SessionNavBar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 ml-12 lg:ml-60 transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              AI Projects Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your AI builds, track progress, and monitor ROI
            </p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects by name, description, or assigned to..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | ProjectStatus)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Deployed">Deployed</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Voice AI Agents">Voice AI Agents</option>
                <option value="Automation Workflows">Automation Workflows</option>
                <option value="Data Extraction & Parsing">Data Extraction & Parsing</option>
                <option value="Dashboards & Analytics">Dashboards & Analytics</option>
                <option value="CRM / Lead Automation">CRM / Lead Automation</option>
                <option value="Property Management Bots">Property Management Bots</option>
                <option value="Accounting / Invoice Automation">Accounting / Invoice Automation</option>
                <option value="E-commerce & Wholesale Automation">E-commerce & Wholesale Automation</option>
                <option value="Internal AI Assistants">Internal AI Assistants</option>
                <option value="Custom Integrations">Custom Integrations</option>
              </select>
              
              <Button className="flex items-center gap-2" onClick={handleAddProject}>
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics?.totalProjects || 0}
                    </p>
                  </div>
                  <FolderOpen className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analytics?.activeProjects || 0}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analytics?.completedProjects || 0}
                    </p>
                  </div>
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(analytics?.totalBudget || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly ROI</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(analytics?.totalRoi || 0)}
                    </p>
                  </div>
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {analytics?.averageProgress || 0}%
                    </p>
                  </div>
                  <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <div className="grid gap-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "No projects found"
                      : "No projects yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start building your AI empire by adding your first project"}
                  </p>
                  <Button className="flex items-center gap-2 mx-auto" onClick={handleAddProject}>
                    <Plus className="h-4 w-4" />
                    Add Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => {
                const ProjectIcon = PROJECT_TYPE_ICONS[project.projectType] || Settings;
                
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <ProjectIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {project.projectType}
                              </p>
                            </div>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {project.description}
                          </p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tech Stack</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {project.stack || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {project.assignedTo || "Unassigned"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly ROI</p>
                              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(project.monthlyRoi)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {formatCurrency(project.budget)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progress
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {project.progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(
                                  project.progressPercentage
                                )}`}
                                style={{ width: `${project.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                              {project.startDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Started {formatDate(project.startDate)}
                                </span>
                              )}
                              {project.clientName && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {project.clientName}
                                </span>
                              )}
                            </div>
                            <span>Updated {formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-6">
                          <Button variant="outline" size="sm" onClick={() => handleViewProject(project)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Project Form Modal */}
      {showAddForm && <ProjectForm />}
    </div>
  );
}
