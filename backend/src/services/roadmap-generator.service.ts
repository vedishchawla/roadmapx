import { comprehendService } from './comprehend.service';
import { prisma } from '../index';

export interface RoadmapGenerationInput {
  description: string;
  goal?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeFrame?: number; // in weeks
  preferences?: string[];
}

export interface GeneratedPhase {
  title: string;
  order: number;
  duration: string;
  description?: string;
  milestones: GeneratedMilestone[];
}

export interface GeneratedMilestone {
  title: string;
  description: string;
  order: number;
  estimatedHours?: number;
  resources?: Array<{
    name: string;
    url: string;
    type: 'link' | 'video' | 'document';
  }>;
}

/**
 * AI-Powered Roadmap Generation Service
 * 
 * Uses Amazon Comprehend to analyze user input and generate personalized learning roadmaps
 */
export class RoadmapGeneratorService {
  /**
   * Analyze user description with Comprehend
   */
  async analyzeUserInput(description: string) {
    const analysis = await comprehendService.analyzeText(description);
    
    // Extract key information
    const skills: string[] = [];
    const topics: string[] = [];
    
    // Extract entities that might be skills or topics
    analysis.entities?.forEach(entity => {
      if (['ORGANIZATION', 'OTHER'].includes(entity.Type || '')) {
        const text = entity.Text?.toLowerCase() || '';
        // Common tech skills patterns
        if (text.includes('javascript') || text.includes('python') || 
            text.includes('react') || text.includes('node') ||
            text.includes('database') || text.includes('api')) {
          skills.push(entity.Text || '');
        }
      }
    });
    
    // Extract key phrases as potential topics
    analysis.keyPhrases?.forEach(phrase => {
      if (phrase.Text) {
        topics.push(phrase.Text);
      }
    });
    
    // Determine sentiment/motivation level
    const sentiment = analysis.sentiment?.Sentiment || 'NEUTRAL';
    const sentimentScore = analysis.sentiment?.SentimentScore || {};
    
    // Detect skill level from description
    const descriptionLower = description.toLowerCase();
    let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    
    if (descriptionLower.includes('advanced') || descriptionLower.includes('expert')) {
      skillLevel = 'advanced';
    } else if (descriptionLower.includes('intermediate') || descriptionLower.includes('some experience')) {
      skillLevel = 'intermediate';
    }
    
    // Extract timeframe if mentioned
    let timeFrame = 12; // default 12 weeks
    const timeFrameMatch = description.match(/(\d+)\s*(week|month|year)/i);
    if (timeFrameMatch) {
      const number = parseInt(timeFrameMatch[1]);
      const unit = timeFrameMatch[2].toLowerCase();
      if (unit === 'month') {
        timeFrame = number * 4;
      } else if (unit === 'year') {
        timeFrame = number * 52;
      } else {
        timeFrame = number;
      }
    }
    
    return {
      skills: skills.length > 0 ? skills : this.extractSkillsFromText(description),
      topics,
      sentiment,
      sentimentScore,
      skillLevel,
      timeFrame,
      language: analysis.language?.[0]?.LanguageCode || 'en',
    };
  }
  
  /**
   * Fallback skill extraction from text
   */
  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
      'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science',
      'Full Stack', 'Frontend', 'Backend', 'DevOps', 'Cloud Computing',
      'Database', 'SQL', 'MongoDB', 'PostgreSQL', 'API Development'
    ];
    
    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
  }
  
  /**
   * Generate roadmap structure based on AI analysis
   */
  async generateRoadmap(input: RoadmapGenerationInput): Promise<{
    title: string;
    description: string;
    skills: string[];
    goal: string;
    timeFrame: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    preference: 'visual' | 'hands-on' | 'theoretical';
    phases: GeneratedPhase[];
  }> {
    // Analyze user input
    const analysis = await this.analyzeUserInput(input.description);
    
    // Extract goal from description or use provided
    let goal = input.goal || this.extractGoal(input.description, analysis.topics);
    
    // Determine preference based on sentiment and keywords
    let preference: 'visual' | 'hands-on' | 'theoretical' = 'hands-on';
    const descLower = input.description.toLowerCase();
    if (descLower.includes('visual') || descLower.includes('video') || descLower.includes('watch')) {
      preference = 'visual';
    } else if (descLower.includes('theory') || descLower.includes('understand') || descLower.includes('concept')) {
      preference = 'theoretical';
    }
    
    // Generate roadmap title
    const title = this.generateTitle(analysis.skills, goal);
    
    // Generate phases based on skills and timeframe
    const phases = this.generatePhases(
      analysis.skills,
      analysis.topics,
      analysis.skillLevel,
      input.timeFrame || analysis.timeFrame,
      preference
    );
    
    return {
      title,
      description: input.description,
      skills: analysis.skills,
      goal,
      timeFrame: input.timeFrame || analysis.timeFrame,
      skillLevel: input.skillLevel || analysis.skillLevel,
      preference,
      phases,
    };
  }
  
  /**
   * Extract goal from description
   */
  private extractGoal(description: string, topics: string[]): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('become') || lowerDesc.includes('be a')) {
      const match = description.match(/(?:become|be a)\s+([^.]+)/i);
      if (match) return match[1].trim();
    }
    
    if (topics.length > 0) {
      return `Master ${topics[0]}`;
    }
    
    return 'Achieve learning goals';
  }
  
  /**
   * Generate roadmap title
   */
  private generateTitle(skills: string[], goal: string): string {
    if (skills.length > 0) {
      return `${skills[0]} Learning Path`;
    }
    if (goal) {
      return goal;
    }
    return 'Learning Roadmap';
  }
  
  /**
   * Generate phases and milestones
   */
  private generatePhases(
    skills: string[],
    topics: string[],
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    timeFrame: number,
    preference: 'visual' | 'hands-on' | 'theoretical'
  ): GeneratedPhase[] {
    const phases: GeneratedPhase[] = [];
    const weeksPerPhase = Math.ceil(timeFrame / 4); // 4 phases default
    
    // Phase 1: Foundations
    phases.push({
      title: 'Foundations & Basics',
      order: 1,
      duration: `${weeksPerPhase} weeks`,
      description: 'Learn the fundamental concepts and set up your development environment',
      milestones: this.generateFoundationMilestones(skills, skillLevel, preference),
    });
    
    // Phase 2: Core Concepts
    phases.push({
      title: 'Core Concepts',
      order: 2,
      duration: `${weeksPerPhase} weeks`,
      description: 'Deep dive into core topics and build understanding',
      milestones: this.generateCoreMilestones(skills, topics, skillLevel, preference),
    });
    
    // Phase 3: Practical Application
    phases.push({
      title: 'Practical Application',
      order: 3,
      duration: `${weeksPerPhase} weeks`,
      description: 'Build projects and apply what you\'ve learned',
      milestones: this.generatePracticalMilestones(skills, skillLevel, preference),
    });
    
    // Phase 4: Advanced & Mastery
    phases.push({
      title: 'Advanced Topics & Mastery',
      order: 4,
      duration: `${weeksPerPhase} weeks`,
      description: 'Explore advanced concepts and refine your skills',
      milestones: this.generateAdvancedMilestones(skills, skillLevel, preference),
    });
    
    return phases;
  }
  
  /**
   * Generate foundation milestones
   */
  private generateFoundationMilestones(
    skills: string[],
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    preference: string
  ): GeneratedMilestone[] {
    const milestones: GeneratedMilestone[] = [];
    
    if (skillLevel === 'beginner') {
      milestones.push({
        title: 'Set up development environment',
        description: 'Install necessary tools and configure your workspace',
        order: 1,
        estimatedHours: 4,
      });
      
      milestones.push({
        title: 'Learn basic concepts',
        description: 'Understand fundamental principles and terminology',
        order: 2,
        estimatedHours: 20,
      });
    } else {
      milestones.push({
        title: 'Review prerequisites',
        description: 'Ensure you have the required foundational knowledge',
        order: 1,
        estimatedHours: 8,
      });
    }
    
    if (skills.length > 0) {
      milestones.push({
        title: `Introduction to ${skills[0]}`,
        description: `Get started with ${skills[0]} basics`,
        order: milestones.length + 1,
        estimatedHours: 15,
      });
    }
    
    return milestones;
  }
  
  /**
   * Generate core concept milestones
   */
  private generateCoreMilestones(
    skills: string[],
    topics: string[],
    skillLevel: string,
    preference: string
  ): GeneratedMilestone[] {
    const milestones: GeneratedMilestone[] = [];
    
    skills.forEach((skill, index) => {
      milestones.push({
        title: `Master ${skill} fundamentals`,
        description: `Deep dive into core ${skill} concepts`,
        order: index + 1,
        estimatedHours: 30,
      });
    });
    
    if (topics.length > 0) {
      milestones.push({
        title: `Explore ${topics[0]}`,
        description: `Learn about ${topics[0]}`,
        order: milestones.length + 1,
        estimatedHours: 25,
      });
    }
    
    return milestones;
  }
  
  /**
   * Generate practical application milestones
   */
  private generatePracticalMilestones(
    skills: string[],
    skillLevel: string,
    preference: string
  ): GeneratedMilestone[] {
    const milestones: GeneratedMilestone[] = [];
    
    milestones.push({
      title: 'Build first project',
      description: 'Create a simple project to practice what you\'ve learned',
      order: 1,
      estimatedHours: 40,
    });
    
    if (skillLevel !== 'beginner') {
      milestones.push({
        title: 'Build intermediate project',
        description: 'Create a more complex project demonstrating your skills',
        order: 2,
        estimatedHours: 60,
      });
    }
    
    if (skills.length > 0) {
      milestones.push({
        title: `Apply ${skills[0]} in real-world scenario`,
        description: `Use ${skills[0]} to solve practical problems`,
        order: milestones.length + 1,
        estimatedHours: 50,
      });
    }
    
    return milestones;
  }
  
  /**
   * Generate advanced milestones
   */
  private generateAdvancedMilestones(
    skills: string[],
    skillLevel: string,
    preference: string
  ): GeneratedMilestone[] {
    const milestones: GeneratedMilestone[] = [];
    
    if (skillLevel === 'advanced') {
      milestones.push({
        title: 'Master advanced techniques',
        description: 'Explore advanced concepts and best practices',
        order: 1,
        estimatedHours: 50,
      });
    } else {
      milestones.push({
        title: 'Explore advanced topics',
        description: 'Learn about advanced concepts and techniques',
        order: 1,
        estimatedHours: 40,
      });
    }
    
    milestones.push({
      title: 'Build portfolio project',
      description: 'Create a comprehensive project for your portfolio',
      order: 2,
      estimatedHours: 80,
    });
    
    milestones.push({
      title: 'Prepare for next steps',
      description: 'Review your progress and plan future learning',
      order: 3,
      estimatedHours: 10,
    });
    
    return milestones;
  }
  
  /**
   * Create roadmap in database
   */
  async createRoadmapInDatabase(
    userId: string,
    generatedData: {
      title: string;
      description: string;
      skills: string[];
      goal: string;
      timeFrame: number;
      skillLevel: 'beginner' | 'intermediate' | 'advanced';
      preference: 'visual' | 'hands-on' | 'theoretical';
      phases: GeneratedPhase[];
    }
  ) {
    return await prisma.roadmap.create({
      data: {
        title: generatedData.title,
        description: generatedData.description,
        skills: generatedData.skills,
        goal: generatedData.goal,
        timeFrame: generatedData.timeFrame,
        skillLevel: generatedData.skillLevel,
        preference: generatedData.preference,
        userId,
        status: 'draft',
        phases: {
          create: generatedData.phases.map(phase => ({
            title: phase.title,
            order: phase.order,
            duration: phase.duration,
            status: 'upcoming',
            milestones: {
              create: phase.milestones.map(milestone => ({
                title: milestone.title,
                description: milestone.description,
                order: milestone.order,
                completed: false,
                resources: {
                  create: milestone.resources || [],
                },
              })),
            },
          })),
        },
      },
      include: {
        phases: {
          include: {
            milestones: {
              include: {
                resources: true,
              },
            },
          },
        },
      },
    });
  }
}

export const roadmapGeneratorService = new RoadmapGeneratorService();

