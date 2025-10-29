import {
  DetectDominantLanguageCommand,
  DetectSentimentCommand,
  DetectEntitiesCommand,
  DetectKeyPhrasesCommand,
  BatchDetectSentimentCommand,
  DetectDominantLanguageCommandOutput,
  DetectSentimentCommandOutput,
  DetectEntitiesCommandOutput,
  DetectKeyPhrasesCommandOutput,
} from '@aws-sdk/client-comprehend';
import { comprehendClient } from '../config/aws-ai';

const useMock = process.env.DEV_FAKE_COMPREHEND === '1';

export interface TextAnalysisResult {
  language?: DetectDominantLanguageCommandOutput['Languages'];
  sentiment?: DetectSentimentCommandOutput;
  entities?: DetectEntitiesCommandOutput['Entities'];
  keyPhrases?: DetectKeyPhrasesCommandOutput['KeyPhrases'];
}

/**
 * Analyze text with Amazon Comprehend
 */
export class ComprehendService {
  /**
   * Detect the language of the input text
   */
  async detectLanguage(text: string) {
    const command = new DetectDominantLanguageCommand({
      Text: text,
    });
    return await comprehendClient.send(command);
  }

  /**
   * Detect sentiment (Positive, Negative, Neutral, Mixed)
   */
  async detectSentiment(text: string, languageCode?: string) {
    try {
      // Auto-detect language if not provided
      if (!languageCode) {
        const langResult = await this.detectLanguage(text);
        languageCode = langResult.Languages?.[0]?.LanguageCode || 'en';
      }

      const command = new DetectSentimentCommand({
        Text: text,
        LanguageCode: languageCode,
      });
      return await comprehendClient.send(command);
    } catch (err: any) {
      if (useMock) {
        return {
          $metadata: {},
          Sentiment: 'NEUTRAL',
          SentimentScore: { Positive: 0.25, Negative: 0.25, Neutral: 0.45, Mixed: 0.05 },
        } as any;
      }
      throw err;
    }
  }

  /**
   * Detect entities (Person, Organization, Location, etc.)
   */
  async detectEntities(text: string, languageCode?: string) {
    try {
      if (!languageCode) {
        const langResult = await this.detectLanguage(text);
        languageCode = langResult.Languages?.[0]?.LanguageCode || 'en';
      }

      const command = new DetectEntitiesCommand({
        Text: text,
        LanguageCode: languageCode,
      });
      return await comprehendClient.send(command);
    } catch (err) {
      if (useMock) {
        return { $metadata: {}, Entities: [] } as any;
      }
      throw err;
    }
  }

  /**
   * Detect key phrases in the text
   */
  async detectKeyPhrases(text: string, languageCode?: string) {
    try {
      if (!languageCode) {
        const langResult = await this.detectLanguage(text);
        languageCode = langResult.Languages?.[0]?.LanguageCode || 'en';
      }

      const command = new DetectKeyPhrasesCommand({
        Text: text,
        LanguageCode: languageCode,
      });
      return await comprehendClient.send(command);
    } catch (err) {
      if (useMock) {
        return { $metadata: {}, KeyPhrases: [] } as any;
      }
      throw err;
    }
  }

  /**
   * Comprehensive text analysis - returns all insights
   */
  async analyzeText(text: string): Promise<TextAnalysisResult> {
    try {
      const languageResult = await this.detectLanguage(text);
      const languageCode = languageResult.Languages?.[0]?.LanguageCode || 'en';

      const [sentimentResult, entitiesResult, keyPhrasesResult] = await Promise.all([
        this.detectSentiment(text, languageCode),
        this.detectEntities(text, languageCode),
        this.detectKeyPhrases(text, languageCode),
      ]);

      return {
        language: languageResult.Languages,
        sentiment: sentimentResult,
        entities: entitiesResult.Entities,
        keyPhrases: keyPhrasesResult.KeyPhrases,
      };
    } catch (err) {
      if (useMock) {
        return {
          language: [{ LanguageCode: 'en', Score: 0.99 }] as any,
          sentiment: { Sentiment: 'NEUTRAL', SentimentScore: { Positive: 0.25, Negative: 0.25, Neutral: 0.45, Mixed: 0.05 } } as any,
          entities: [],
          keyPhrases: [],
        };
      }
      throw err;
    }
  }

  /**
   * Batch sentiment analysis for multiple texts
   */
  async batchDetectSentiment(textList: string[], languageCode: string = 'en') {
    const command = new BatchDetectSentimentCommand({
      TextList: textList,
      LanguageCode: languageCode,
    });
    return await comprehendClient.send(command);
  }
}

export const comprehendService = new ComprehendService();

