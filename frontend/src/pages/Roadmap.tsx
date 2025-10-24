import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const Roadmap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        if (id) {
          const data = await apiClient.getRoadmap(id);
          setRoadmap(data);
        } else {
          // If no ID, get the first roadmap or show a message
          const roadmaps = await apiClient.getRoadmaps();
          if (roadmaps.length > 0) {
            setRoadmap(roadmaps[0]);
          } else {
            setError("No roadmaps found. Create one from the dashboard!");
          }
        }
      } catch (err) {
        console.error('Error fetching roadmap:', err);
        setError("Failed to load roadmap");
        toast.error("Failed to load roadmap");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    try {
      // This would need to be implemented based on your progress tracking logic
      toast.success(`Milestone ${completed ? 'completed' : 'marked as incomplete'}`);
    } catch (error) {
      toast.error("Failed to update milestone");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-secondary">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-secondary">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen gradient-secondary">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Roadmap Found</h1>
            <p className="text-muted-foreground mb-4">Create your first roadmap to get started!</p>
            <Button onClick={() => navigate('/dashboard')}>
              Create Roadmap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-secondary">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">{roadmap.title}</h1>
          <p className="text-muted-foreground">{roadmap.description}</p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">{roadmap.skillLevel}</Badge>
            <Badge variant="outline">{roadmap.timeFrame} months</Badge>
            <Badge variant="outline">{roadmap.preference}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {roadmap.phases?.map((phase: any) => (
            <Card key={phase.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{phase.title}</span>
                  <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                    {phase.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Duration: {phase.duration}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phase.milestones?.map((milestone: any) => (
                    <div key={milestone.id} className="flex items-start space-x-3">
                      <button
                        onClick={() => handleMilestoneToggle(milestone.id, !milestone.completed)}
                        className="mt-1"
                      >
                        {milestone.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.resources && milestone.resources.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Resources:</p>
                            <div className="space-y-1">
                              {milestone.resources.map((resource: any, index: number) => (
                                <a
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline block"
                                >
                                  {resource.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mock roadmap data for reference
const mockRoadmapData = [
  {
    id: 1,
    phase: "Foundation",
    title: "Master the Basics",
    duration: "2-3 weeks",
    status: "completed",
    milestones: [
      { 
        id: 1, 
        title: "HTML & CSS Fundamentals", 
        completed: true,
        resources: [
          { name: "MDN Web Docs", url: "#" },
          { name: "freeCodeCamp", url: "#" }
        ]
      },
      { 
        id: 2, 
        title: "JavaScript Basics", 
        completed: true,
        resources: [
          { name: "JavaScript.info", url: "#" },
          { name: "Eloquent JavaScript", url: "#" }
        ]
      },
      { 
        id: 3, 
        title: "Git & Version Control", 
        completed: true,
        resources: [
          { name: "Git Documentation", url: "#" },
          { name: "GitHub Learning Lab", url: "#" }
        ]
      },
    ]
  },
  {
    id: 2,
    phase: "Frontend Development",
    title: "Build Interactive UIs",
    duration: "4-6 weeks",
    status: "in-progress",
    milestones: [
      { 
        id: 4, 
        title: "React Fundamentals", 
        completed: true,
        resources: [
          { name: "React Official Docs", url: "#" },
          { name: "React Tutorial", url: "#" }
        ]
      },
      { 
        id: 5, 
        title: "State Management with Redux", 
        completed: false,
        resources: [
          { name: "Redux Toolkit", url: "#" },
          { name: "Redux Essentials", url: "#" }
        ]
      },
      { 
        id: 6, 
        title: "Component Patterns", 
        completed: false,
        resources: [
          { name: "React Patterns", url: "#" },
          { name: "Advanced React", url: "#" }
        ]
      },
    ]
  },
  {
    id: 3,
    phase: "Backend Development",
    title: "Server-Side Skills",
    duration: "4-5 weeks",
    status: "upcoming",
    milestones: [
      { 
        id: 7, 
        title: "Node.js & Express", 
        completed: false,
        resources: [
          { name: "Node.js Documentation", url: "#" },
          { name: "Express.js Guide", url: "#" }
        ]
      },
      { 
        id: 8, 
        title: "Database Design (PostgreSQL)", 
        completed: false,
        resources: [
          { name: "PostgreSQL Tutorial", url: "#" },
          { name: "Database Design", url: "#" }
        ]
      },
      { 
        id: 9, 
        title: "REST API Development", 
        completed: false,
        resources: [
          { name: "REST API Best Practices", url: "#" },
          { name: "API Design Guide", url: "#" }
        ]
      },
    ]
  },
  {
    id: 4,
    phase: "Advanced Topics",
    title: "Production-Ready Development",
    duration: "3-4 weeks",
    status: "upcoming",
    milestones: [
      { 
        id: 10, 
        title: "Authentication & Authorization", 
        completed: false,
        resources: [
          { name: "JWT Authentication", url: "#" },
          { name: "OAuth 2.0 Guide", url: "#" }
        ]
      },
      { 
        id: 11, 
        title: "Testing (Jest, React Testing Library)", 
        completed: false,
        resources: [
          { name: "Jest Documentation", url: "#" },
          { name: "Testing Library", url: "#" }
        ]
      },
      { 
        id: 12, 
        title: "Deployment & CI/CD", 
        completed: false,
        resources: [
          { name: "Vercel Deploy Guide", url: "#" },
          { name: "GitHub Actions", url: "#" }
        ]
      },
    ]
  },
];


export default Roadmap;
