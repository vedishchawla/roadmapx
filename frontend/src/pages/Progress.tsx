import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";

const progressData = {
  overall: 35,
  phases: [
    { name: "Foundation", progress: 100, color: "bg-secondary" },
    { name: "Frontend Development", progress: 66, color: "bg-primary" },
    { name: "Backend Development", progress: 0, color: "bg-accent" },
    { name: "Advanced Topics", progress: 0, color: "bg-muted" },
  ],
  stats: {
    totalHours: 47,
    completedMilestones: 5,
    totalMilestones: 12,
    currentStreak: 7,
  },
  recentActivity: [
    { date: "2024-01-15", milestone: "Completed React Fundamentals", hours: 4 },
    { date: "2024-01-14", milestone: "Git & Version Control", hours: 3 },
    { date: "2024-01-13", milestone: "JavaScript Basics", hours: 5 },
  ]
};

const ProgressPage = () => {
  return (
    <div className="min-h-screen gradient-secondary">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Progress
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary">{progressData.overall}%</div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-secondary">{progressData.stats.totalHours}</div>
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-accent">
                  {progressData.stats.completedMilestones}/{progressData.stats.totalMilestones}
                </div>
                <Target className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {progressData.stats.currentStreak} days
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Phase Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Progress by Phase</CardTitle>
                <CardDescription>Your completion rate for each learning phase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {progressData.phases.map((phase, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{phase.name}</span>
                      <Badge variant="secondary">{phase.progress}%</Badge>
                    </div>
                    <Progress value={phase.progress} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your journey to becoming a Full-Stack Developer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={progressData.overall} className="h-4" />
                  <p className="text-sm text-muted-foreground">
                    You're {progressData.overall}% of the way there! Keep up the great work.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="shadow-medium gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.recentActivity.map((activity, index) => (
                  <div key={index} className="space-y-1 pb-4 border-b border-border last:border-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {activity.date}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {activity.hours}h
                      </span>
                    </div>
                    <p className="text-sm font-medium">{activity.milestone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Card */}
        <Card className="mt-6 shadow-medium gradient-primary border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Keep Going! 🚀</h3>
                <p className="text-white/90">
                  You've completed {progressData.stats.completedMilestones} milestones. 
                  Only {progressData.stats.totalMilestones - progressData.stats.completedMilestones} more to go!
                </p>
              </div>
              <Trophy className="w-16 h-16 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
