import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Plus, Search } from "lucide-react";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { useProjectStore } from "@/store/projectStore";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";


export default function Projects() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { projects, loading, error, getProjects } = useProjectStore();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const handleProjectClick = (id) => {
        setSelectedProjectId(id);
        setDetailsOpen(true);
    };

    useEffect(() => {
        getProjects();
    }, [getProjects]);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.shortname
            ? project.shortname.toLowerCase().includes(searchQuery.toLowerCase())
            : "".includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">Projects</h1>
                        <p className="text-muted-foreground mt-2">Manage your projects</p>
                    </div>
                    <Button variant="gradient" onClick={() => setCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {loading && <div className="text-muted-foreground mt-2">Loading projects...</div>}
                        {error && <div className="text-red-500 mt-2">{error}</div>}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => handleProjectClick(project.id)}  // Dodaj obsługę kliknięcia!
                        >
                            <CardHeader>
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle className="mb-1">{project.shortName}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{project.description}</p>
                                    </div>
                                    <Badge variant={project.status === "completed" ? "done" : "inprogress"}>
                                        {project.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        {/* Jeśli backend nie zwraca progress - wyświetl placeholder */}
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Progress</span>
                                            <span>
                        {typeof project.progress !== "undefined"
                            ? `${project.progress}%`
                            : "N/A"}
                      </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full">
                                            <div
                                                className="h-2 bg-primary rounded-full"
                                                style={{
                                                    width:
                                                        typeof project.progress !== "undefined"
                                                            ? `${project.progress}%`
                                                            : "0%",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(project.team || [])
                                            .slice(0, 3)
                                            .map((member, i) => (
                                                <Avatar key={i} className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">{member}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CreateProjectModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
            <ProjectDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                projectId={selectedProjectId}
            />
        </AppLayout>
    );
}
