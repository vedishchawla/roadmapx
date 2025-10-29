import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Target, Brain, Clock, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [timeFrame, setTimeFrame] = useState([3]);
  const [skillLevel, setSkillLevel] = useState("");
  const [learningPreference, setLearningPreference] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getTimeFrameLabel = (months: number) => {
    if (months === 1) return "1 month";
    if (months < 12) return `${months} months`;
    return `${months / 12} year${months > 12 ? 's' : ''}`;
  };

  const handleGenerateRoadmap = async () => {
    if (!goal.trim()) {
      toast.error("Please enter your learning goal/description");
      return;
    }

    setIsGenerating(true);
    try {
      // Build a natural language description that AI endpoint expects
      const descriptionParts: string[] = [];
      if (goal.trim()) descriptionParts.push(goal.trim());
      if (skills.trim()) descriptionParts.push(`My current skills: ${skills}.`);
      if (skillLevel) descriptionParts.push(`My skill level is ${skillLevel}.`);
      if (timeFrame?.[0]) descriptionParts.push(`I have ${timeFrame[0]} ${timeFrame[0] === 1 ? 'month' : 'months'} to learn.`);
      if (learningPreference) descriptionParts.push(`I prefer ${learningPreference} learning.`);

      const description = descriptionParts.join(' ');

      const result: any = await apiClient.generateAiRoadmap(description);
      const roadmap = result.roadmap || result; // backend returns { roadmap, aiAnalysis }
      toast.success("Roadmap generated successfully!");
      navigate(`/roadmap/${roadmap.id}`);
    } catch (error) {
      console.error('Error generating AI roadmap:', error);
      toast.error("Failed to generate roadmap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen gradient-secondary">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Your Learning Roadmap
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us about your skills and goals, and we'll create a personalized learning path for you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-primary" />
                  <CardTitle>🧠 Current Skills</CardTitle>
                </div>
                <CardDescription>List your current skills (comma-separated)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., HTML, CSS, JavaScript, Python, Git..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="min-h-24 transition-smooth"
                />
              </CardContent>
            </Card>

            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-secondary" />
                  <CardTitle>🎯 Learning Goal</CardTitle>
                </div>
                <CardDescription>What do you want to achieve?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Become a full-stack developer, Learn AWS Cloud, Build mobile apps..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-24 transition-smooth"
                />
              </CardContent>
            </Card>

            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-accent" />
                  <CardTitle>⏰ Time Frame</CardTitle>
                </div>
                <CardDescription>How long do you have to achieve your goal?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Duration: {getTimeFrameLabel(timeFrame[0])}</Label>
                </div>
                <Slider
                  value={timeFrame}
                  onValueChange={setTimeFrame}
                  min={1}
                  max={24}
                  step={1}
                  className="transition-smooth"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 month</span>
                  <span>6 months</span>
                  <span>1 year</span>
                  <span>2 years</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <CardTitle>📈 Current Skill Level</CardTitle>
                </div>
                <CardDescription>How would you rate your overall technical skills?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger className="transition-smooth">
                    <SelectValue placeholder="Select your skill level" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                    <SelectItem value="advanced">Advanced - Experienced professional</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-6 h-6 text-secondary" />
                  <CardTitle>🧩 Learning Preference</CardTitle>
                </div>
                <CardDescription>How do you prefer to learn?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={learningPreference} onValueChange={setLearningPreference}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/50 transition-smooth cursor-pointer">
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video" className="cursor-pointer flex-1">
                        Video tutorials - Watch and learn from instructors
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/50 transition-smooth cursor-pointer">
                      <RadioGroupItem value="documentation" id="documentation" />
                      <Label htmlFor="documentation" className="cursor-pointer flex-1">
                        Documentation - Read official docs and articles
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/50 transition-smooth cursor-pointer">
                      <RadioGroupItem value="hands-on" id="hands-on" />
                      <Label htmlFor="hands-on" className="cursor-pointer flex-1">
                        Hands-on projects - Learn by building and doing
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-medium gradient-primary border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white">Ready to Start?</CardTitle>
                <CardDescription className="text-white/80">
                  Generate your personalized roadmap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGenerateRoadmap}
                  disabled={isGenerating}
                  className="w-full bg-white text-primary hover:bg-white/90 shadow-medium transition-smooth"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Roadmap
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-medium gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>✨ Be specific about your goals for better results</p>
                <p>🎯 Add all relevant skills you currently have</p>
                <p>⏰ Choose a realistic time commitment</p>
                <p>🚀 You can always regenerate your roadmap later</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
