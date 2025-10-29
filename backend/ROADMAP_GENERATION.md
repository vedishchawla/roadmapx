# AI-Powered Roadmap Generation Guide

## How It Works

The roadmap generation uses Amazon Comprehend to analyze user input and automatically create structured learning paths.

## Architecture

```
User Input (Natural Language)
    ↓
Amazon Comprehend
    ├─ Text Analysis
    ├─ Entity Detection (skills, technologies)
    ├─ Key Phrase Extraction (topics)
    └─ Sentiment Analysis (motivation level)
    ↓
Roadmap Generator Service
    ├─ Extracts Skills & Goals
    ├─ Determines Difficulty Level
    ├─ Calculates Timeframe
    └─ Generates Phases & Milestones
    ↓
Database (Prisma)
    └─ Creates Roadmap with Structure
```

## API Endpoints

### 1. Generate Roadmap with AI

**POST** `/api/roadmaps/ai/generate`

**Request:**
```json
{
  "description": "I want to become a full-stack JavaScript developer in 6 months. I'm a beginner but very motivated.",
  "goal": "Become a full-stack developer",
  "skillLevel": "beginner",
  "timeFrame": 24,
  "preferences": ["hands-on", "projects"]
}
```

**Response:**
```json
{
  "message": "Roadmap generated successfully using AI",
  "roadmap": {
    "id": "clx...",
    "title": "JavaScript Learning Path",
    "description": "I want to become a full-stack JavaScript developer...",
    "skills": ["JavaScript", "Full Stack"],
    "goal": "Become a full-stack developer",
    "timeFrame": 24,
    "skillLevel": "beginner",
    "preference": "hands-on",
    "phases": [
      {
        "title": "Foundations & Basics",
        "order": 1,
        "duration": "6 weeks",
        "milestones": [...]
      },
      ...
    ]
  },
  "aiAnalysis": {
    "skillsDetected": ["JavaScript", "Full Stack"],
    "timeFrame": 24,
    "skillLevel": "beginner"
  }
}
```

### 2. Analyze Text (Preview)

**POST** `/api/roadmaps/ai/analyze`

**Request:**
```json
{
  "description": "I want to learn machine learning with Python"
}
```

**Response:**
```json
{
  "analysis": {
    "skills": ["Python", "Machine Learning"],
    "topics": ["machine learning", "python"],
    "sentiment": "POSITIVE",
    "skillLevel": "beginner",
    "timeFrame": 12
  },
  "suggestions": {
    "recommendedSkills": ["Python", "Machine Learning"],
    "estimatedTimeFrame": "12 weeks",
    "recommendedLevel": "beginner",
    "motivationLevel": "POSITIVE"
  }
}
```

### 3. Enhance Existing Roadmap

**POST** `/api/roadmaps/:id/ai/enhance`

Analyzes your existing roadmap and suggests improvements based on AI insights.

**Response:**
```json
{
  "roadmapId": "clx...",
  "suggestions": {
    "skillGaps": ["TypeScript", "Docker"],
    "progressInsights": {
      "completionRate": 0.45,
      "recommendedNextSteps": ["Practical Application", "Build Projects"]
    },
    "aiRecommendations": {
      "skillsToAdd": ["TypeScript", "Docker", "CI/CD"],
      "estimatedTimeline": "16 weeks",
      "learningStyle": "accelerated"
    }
  }
}
```

## Example Usage

### Frontend Integration

```javascript
// Generate a roadmap from user description
async function generateRoadmap(description) {
  const response = await fetch('/api/roadmaps/ai/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: description,
      // Optional parameters
      skillLevel: 'beginner',
      timeFrame: 12
    })
  });
  
  const data = await response.json();
  return data.roadmap;
}

// Use it
const roadmap = await generateRoadmap(
  "I want to learn React and Node.js to build web applications. I have some JavaScript experience."
);
```

### Step-by-Step Example

**Step 1: User provides description**
```
"I want to become a data scientist focusing on machine learning with Python. 
I'm a beginner but very motivated. I have 6 months to learn."
```

**Step 2: AI Analysis (Comprehend)**
- Extracts skills: `["Python", "Machine Learning", "Data Science"]`
- Detects timeframe: `24 weeks` (6 months)
- Identifies level: `beginner`
- Analyzes sentiment: `POSITIVE` (high motivation)

**Step 3: Roadmap Generation**
Creates 4 phases:
1. **Foundations** (6 weeks) - Python basics, ML concepts
2. **Core Concepts** (6 weeks) - Algorithms, libraries
3. **Practical Application** (6 weeks) - Projects, datasets
4. **Advanced Topics** (6 weeks) - Deep learning, production

**Step 4: Save to Database**
Roadmap created with all phases, milestones, and structure.

## Integration with Other Services

### Personalize Integration (When Available)

Once Personalize is set up, the roadmap generator can:
- Recommend resources based on similar users
- Suggest optimal learning order
- Personalize difficulty based on user behavior

**Example:**
```typescript
// Future enhancement
const recommendations = await personalizeService.getRecommendations(userId);
// Use recommendations to populate roadmap resources
```

### SageMaker Integration (Advanced)

With SageMaker, you can:
- Train custom models on successful roadmaps
- Predict optimal phase structure
- Optimize milestone sequencing

**Example:**
```typescript
// Future enhancement
const optimalPath = await sagemakerService.predictOptimalPath(userProfile);
// Use prediction to refine roadmap structure
```

## Current Implementation Status

✅ **Comprehend Integration**: Complete
- Text analysis works
- Skill extraction works
- Roadmap generation works

⏳ **Personalize Integration**: Pending S3 setup
- Need historical data
- Need user interactions dataset

⏳ **SageMaker Integration**: Future enhancement
- Requires training data
- Advanced use case

## Testing

### Test Roadmap Generation

```bash
curl -X POST http://localhost:3001/api/roadmaps/ai/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I want to learn AWS cloud computing and become a cloud architect"
  }'
```

### Test Analysis Only

```bash
curl -X POST http://localhost:3001/api/roadmaps/ai/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I want to learn React and build modern web applications"
  }'
```

## Customization

### Adjusting Phase Generation

Edit `backend/src/services/roadmap-generator.service.ts`:

```typescript
// Modify generatePhases() to customize phase structure
private generatePhases(...) {
  // Add custom logic here
}
```

### Adding More Skills

Update `extractSkillsFromText()` to include more skill patterns:

```typescript
private extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    // Add your custom skills here
    'Your Custom Skill',
    ...
  ];
}
```

## Next Steps

1. ✅ **Test Comprehend integration** - Works immediately
2. ⏳ **Set up S3** - For Personalize recommendations
3. ⏳ **Collect user data** - For training Personalize models
4. ⏳ **Integrate Personalize** - For resource recommendations
5. 🔮 **Future: SageMaker** - For advanced path optimization

