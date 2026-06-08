import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Question,
  QuestionsResponse,
  EvaluationResult,
  FinalReport,
  InterviewContext,
  Answer
} from '@shared/models/ai.model';
import {
  buildQuestionPrompt
} from '@app/prompts/question.prompt';
import {
  buildEvaluationPrompt
} from '@app/prompts/evaluation.prompt';
import {
  buildReportPrompt
} from '@app/prompts/rapport.prompt';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private apiKey = '';
  private backendUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private config: ConfigService) {
    // Load API key from config service
    this.apiKey = this.config.get('GEMINI_API_KEY');
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not configured. Please set it in your environment.');
    }
    this.initializeGemini();
  }

  private getGeminiApiKey(): string {
    // Try to get from environment first, then window variable
    if (typeof (window as any).__GEMINI_API_KEY__ !== 'undefined') {
      return (window as any).__GEMINI_API_KEY__;
    }
    throw new Error('❌ GEMINI_API_KEY not configured. Please set it in environment.ts');
  }

  private initializeGemini(): void {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('✅ Gemini API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini API:', error);
    }
  }

  /**
   * Génère des questions d'entretien basées sur le contexte
   */
  generateQuestions(context: InterviewContext): Observable<Question[]> {
    return from(this.generateQuestionsAsync(context)).pipe(
      catchError(error => {
        console.error('Error generating questions:', error);
        return throwError(() => new Error('Impossible de générer les questions'));
      })
    );
  }

  private async generateQuestionsAsync(context: InterviewContext): Promise<Question[]> {
    const prompt = buildQuestionPrompt(
      context.jobTitle,
      context.company,
      context.jobDescription,
      context.level
    );

    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsed: QuestionsResponse = JSON.parse(jsonMatch[0]);
    return parsed.questions || [];
  }

  /**
   * Évalue une réponse du candidat
   */
  evaluateAnswer(
    question: string,
    answer: string,
    requiredSkills: string[]
  ): Observable<EvaluationResult> {
    return from(this.evaluateAnswerAsync(question, answer, requiredSkills)).pipe(
      catchError(error => {
        console.error('Error evaluating answer:', error);
        return throwError(() => new Error('Impossible d\'évaluer la réponse'));
      })
    );
  }

  private async evaluateAnswerAsync(
    question: string,
    answer: string,
    requiredSkills: string[]
  ): Promise<EvaluationResult> {
    const prompt = buildEvaluationPrompt(question, answer, requiredSkills);

    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();

    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Génère un rapport final d'entretien
   */
  generateReport(
    candidateName: string,
    jobTitle: string,
    company: string,
    level: string,
    questionCount: number,
    averageScore: number,
    answers: Answer[]
  ): Observable<FinalReport> {
    return from(
      this.generateReportAsync(
        candidateName,
        jobTitle,
        company,
        level,
        questionCount,
        averageScore,
        answers
      )
    ).pipe(
      catchError(error => {
        console.error('Error generating report:', error);
        return throwError(() => new Error('Impossible de générer le rapport'));
      })
    );
  }

  private async generateReportAsync(
    candidateName: string,
    jobTitle: string,
    company: string,
    level: string,
    questionCount: number,
    averageScore: number,
    answers: Answer[]
  ): Promise<FinalReport> {
    const questionResults = answers
      .map(a => `Q: ${a.question}\nR: ${a.candidateAnswer}\nScore: ${a.evaluation?.score || 0}`)
      .join('\n\n');

    const demonstratedSkills = Array.from(
      new Set(
        answers
          .flatMap(a => a.evaluation?.competences_demontrees || [])
      )
    );

    const prompt = buildReportPrompt(
      candidateName,
      jobTitle,
      company,
      level,
      questionCount,
      averageScore,
      new Date().toLocaleDateString('fr-FR'),
      questionResults,
      demonstratedSkills
    );

    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();

    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Analyse la description du poste pour extraire les compétences clés
   */
  analyzeJobDescription(jobDescription: string): Observable<string[]> {
    const prompt = `Analyse cette description de poste et extrais les 5-7 compétences techniques clés requises. 
Réponds UNIQUEMENT avec un array JSON de chaînes:
["competence1", "competence2", ...]

Description: ${jobDescription}`;

    return from(this.analyzeJobDescriptionAsync(prompt)).pipe(
      catchError(error => {
        console.error('Error analyzing job description:', error);
        return throwError(() => new Error('Impossible d\'analyser la description du poste'));
      })
    );
  }

  private async analyzeJobDescriptionAsync(prompt: string): Promise<string[]> {
    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();

    // Extraire le JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Crée un entretien via le backend
   */
  createInterview(context: InterviewContext): Observable<any> {
    return this.http.post(`${this.backendUrl}/interviews`, {
      candidateId: context.candidateId || 'unknown',
      jobDescriptionContent: context.jobDescription,
      mode: context.mode,
      questionCount: context.questionCount || 5
    }).pipe(
      catchError(error => {
        console.error('Error creating interview:', error);
        return throwError(() => new Error('Impossible de créer l\'entretien'));
      })
    );
  }

  /**
   * Récupère un entretien existant
   */
  getInterview(interviewId: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/interviews/${interviewId}`).pipe(
      catchError(error => {
        console.error('Error fetching interview:', error);
        return throwError(() => new Error('Impossible de récupérer l\'entretien'));
      })
    );
  }

  /**
   * Soumet une réponse d'entretien
   */
  submitAnswer(
    interviewId: string,
    questionId: string,
    answerContent: string
  ): Observable<any> {
    return this.http.post(
      `${this.backendUrl}/chat/interviews/${interviewId}/answers`,
      {
        questionId,
        answerContent
      }
    ).pipe(
      catchError(error => {
        console.error('Error submitting answer:', error);
        return throwError(() => new Error('Impossible de soumettre la réponse'));
      })
    );
  }

  /**
   * Génère un rapport via le backend
   */
  getReportFromBackend(interviewId: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/reports/interviews/${interviewId}`).pipe(
      catchError(error => {
        console.error('Error getting report from backend:', error);
        return throwError(() => new Error('Impossible de récupérer le rapport'));
      })
    );
  }

  /**
   * Démarre un entretien
   */
  startInterview(interviewId: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/interviews/${interviewId}/start`, {}).pipe(
      catchError(error => {
        console.error('Error starting interview:', error);
        return throwError(() => new Error('Impossible de démarrer l\'entretien'));
      })
    );
  }

  /**
   * Termine un entretien
   */
  completeInterview(interviewId: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/interviews/${interviewId}/complete`, {}).pipe(
      catchError(error => {
        console.error('Error completing interview:', error);
        return throwError(() => new Error('Impossible de terminer l\'entretien'));
      })
    );
  }
}
