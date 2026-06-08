import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '@core/services/ai.service';
import { Question, InterviewContext, Answer, EvaluationResult } from '@shared/models/ai.model';

@Component({
  selector: 'app-chat-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>{{ isLoading ? 'Génération des questions...' : 'Mode Chat - Entretien' }}</h2>
        <p *ngIf="currentContext">{{ currentContext.company }} - {{ currentContext.jobTitle }}</p>
      </div>

      <div class="chat-content">
        <!-- Questions générées -->
        <div *ngIf="!isStarted && questions.length === 0" class="setup-section">
          <h3>Configurer votre entretien</h3>
          
          <div class="form-group">
            <label>Nom du candidat</label>
            <input [(ngModel)]="candidateName" type="text" placeholder="Votre nom">
          </div>

          <div class="form-group">
            <label>Poste visé</label>
            <input [(ngModel)]="jobTitle" type="text" placeholder="Ex: Développeur Senior">
          </div>

          <div class="form-group">
            <label>Entreprise</label>
            <input [(ngModel)]="company" type="text" placeholder="Ex: Google">
          </div>

          <div class="form-group">
            <label>Description du poste</label>
            <textarea [(ngModel)]="jobDescription" rows="4" placeholder="Description du poste..."></textarea>
          </div>

          <div class="form-group">
            <label>Niveau d'expérience</label>
            <select [(ngModel)]="level">
              <option value="JUNIOR">Junior</option>
              <option value="CONFIRME">Confirmé</option>
              <option value="SENIOR">Senior</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <button (click)="startInterview()" [disabled]="isLoading || !candidateName || !jobTitle || !company || !jobDescription" class="btn-primary">
            {{ isLoading ? 'Génération...' : 'Démarrer l\'entretien' }}
          </button>

          <div *ngIf="error" class="error-message">{{ error }}</div>
        </div>

        <!-- Chat pendant l'entretien -->
        <div *ngIf="isStarted && questions.length > 0" class="interview-section">
          <div class="progress-bar">
            <div class="progress" [style.width.%]="(currentQuestionIndex + 1) / questions.length * 100"></div>
          </div>
          <p class="progress-text">Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}</p>

          <!-- Question actuelle -->
          <div class="question-block">
            <h3>Question {{ currentQuestionIndex + 1 }}</h3>
            <p class="question-text">{{ questions[currentQuestionIndex]?.content }}</p>
            <span class="category" [class]="'category-' + questions[currentQuestionIndex]?.category.toLowerCase()">
              {{ questions[currentQuestionIndex]?.category }}
            </span>
          </div>

          <!-- Réponse du candidat -->
          <div class="answer-block">
            <label>Votre réponse</label>
            <textarea [(ngModel)]="currentAnswer" rows="6" placeholder="Saisissez votre réponse..."></textarea>
          </div>

          <!-- Boutons d'action -->
          <div class="action-buttons">
            <button (click)="previousQuestion()" [disabled]="currentQuestionIndex === 0" class="btn-secondary">
              ← Précédent
            </button>
            <button (click)="evaluateAndNext()" [disabled]="!currentAnswer.trim() || isEvaluating" class="btn-primary">
              {{ isEvaluating ? 'Évaluation...' : 'Suivant →' }}
            </button>
          </div>

          <!-- Erreur d'évaluation -->
          <div *ngIf="error" class="error-message">{{ error }}</div>
        </div>

        <!-- Résultats -->
        <div *ngIf="isCompleted" class="results-section">
          <h3>Entretien terminé!</h3>
          <div class="score-card">
            <p class="score-label">Score moyen</p>
            <p class="score-value">{{ averageScore | number:'1.1-1' }}/100</p>
          </div>

          <div class="answers-review">
            <h4>Récapitulatif de vos réponses</h4>
            <div *ngFor="let answer of answers; let i = index" class="answer-review">
              <p><strong>Q{{ i + 1 }}: </strong>{{ answer.question }}</p>
              <p><strong>Votre réponse: </strong>{{ answer.candidateAnswer }}</p>
              <p *ngIf="answer.evaluation" class="evaluation">
                <strong>Score: </strong>{{ answer.evaluation.score }}/100
              </p>
              <hr>
            </div>
          </div>

          <button (click)="resetInterview()" class="btn-secondary">Nouvel entretien</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #2563EB;
      --secondary: #0F172A;
      --accent: #14B8A6;
      --danger: #EF4444;
      --background: #F8FAFC;
      --border: #E2E8F0;
    }

    .chat-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      font-family: 'Poppins', 'Inter', sans-serif;
    }

    .chat-header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .chat-header h2 {
      margin: 0 0 8px 0;
      color: var(--secondary);
      font-size: 28px;
      font-weight: bold;
    }

    .chat-header p {
      margin: 0;
      color: #64748B;
      font-size: 14px;
    }

    .chat-content {
      min-height: 400px;
    }

    /* Setup Section */
    .setup-section, .interview-section, .results-section {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: var(--secondary);
      font-weight: 600;
      font-size: 14px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    /* Interview Section */
    .progress-bar {
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: right;
      color: #64748B;
      font-size: 12px;
      margin-bottom: 20px;
    }

    .question-block {
      background: var(--background);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      border-left: 4px solid var(--primary);
    }

    .question-block h3 {
      margin: 0 0 12px 0;
      color: var(--secondary);
      font-size: 16px;
    }

    .question-text {
      font-size: 16px;
      color: var(--secondary);
      line-height: 1.6;
      margin: 0 0 12px 0;
    }

    .category {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }

    .category-technical { background: #DDD6FE; color: #4C1D95; }
    .category-behavioral { background: #DBEAFE; color: #0C4A6E; }
    .category-cultural { background: #D1FAE5; color: #065F46; }
    .category-motivation { background: #FEF08A; color: #713F12; }

    .answer-block {
      margin-bottom: 20px;
    }

    .answer-block label {
      display: block;
      margin-bottom: 8px;
      color: var(--secondary);
      font-weight: 600;
      font-size: 14px;
    }

    .answer-block textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }

    .answer-block textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--border);
      color: var(--secondary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: #CBD5E1;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Results Section */
    .results-section {
      text-align: center;
    }

    .results-section h3 {
      color: var(--secondary);
      font-size: 24px;
      margin-bottom: 24px;
    }

    .score-card {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 32px;
    }

    .score-label {
      margin: 0 0 8px 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .score-value {
      margin: 0;
      font-size: 48px;
      font-weight: bold;
    }

    .answers-review {
      text-align: left;
      margin-bottom: 24px;
    }

    .answers-review h4 {
      color: var(--secondary);
      margin-bottom: 16px;
    }

    .answer-review {
      padding: 12px;
      background: var(--background);
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .answer-review p {
      margin: 8px 0;
      font-size: 14px;
    }

    .evaluation {
      color: var(--primary);
      font-weight: 600;
    }

    .error-message {
      background: #FEE2E2;
      color: var(--danger);
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      font-size: 14px;
    }

    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 12px 0;
    }
  `]
})
export class ChatModeComponent implements OnInit {
  // Form inputs
  candidateName = '';
  jobTitle = '';
  company = '';
  jobDescription = '';
  level: 'JUNIOR' | 'CONFIRME' | 'SENIOR' | 'EXPERT' = 'CONFIRME';

  // State
  isLoading = false;
  isEvaluating = false;
  isStarted = false;
  isCompleted = false;
  error = '';

  // Interview data
  questions: Question[] = [];
  answers: Answer[] = [];
  currentQuestionIndex = 0;
  currentAnswer = '';
  currentContext: InterviewContext | null = null;
  averageScore = 0;

  constructor(private aiService: AiService) {}

  ngOnInit(): void {
    // Initialize component
  }

  startInterview(): void {
    this.error = '';
    this.isLoading = true;

    this.currentContext = {
      candidateName: this.candidateName,
      jobTitle: this.jobTitle,
      company: this.company,
      jobDescription: this.jobDescription,
      level: this.level,
      mode: 'CHAT',
      questionCount: 5
    };

    this.aiService.generateQuestions(this.currentContext).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.isStarted = true;
        this.isLoading = false;
        this.currentQuestionIndex = 0;
        this.currentAnswer = '';
      },
      error: (err) => {
        this.error = 'Erreur lors de la génération des questions: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  evaluateAndNext(): void {
    if (!this.currentAnswer.trim()) return;

    this.error = '';
    this.isEvaluating = true;

    const currentQuestion = this.questions[this.currentQuestionIndex];
    
    this.aiService.evaluateAnswer(
      currentQuestion.content,
      this.currentAnswer,
      currentQuestion.requiredSkills
    ).subscribe({
      next: (evaluation) => {
        this.answers.push({
          questionId: currentQuestion.id || `q${this.currentQuestionIndex}`,
          question: currentQuestion.content,
          candidateAnswer: this.currentAnswer,
          evaluation
        });

        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
          this.currentAnswer = '';
          this.isEvaluating = false;
        } else {
          this.completeInterview();
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'évaluation: ' + err.message;
        this.isEvaluating = false;
      }
    });
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      const previousAnswer = this.answers.find(
        a => a.questionId === this.questions[this.currentQuestionIndex].id
      );
      this.currentAnswer = previousAnswer?.candidateAnswer || '';
    }
  }

  completeInterview(): void {
    this.isStarted = false;
    this.isCompleted = true;
    this.isEvaluating = false;

    // Calculate average score
    this.averageScore =
      this.answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) /
      this.answers.length;
  }

  resetInterview(): void {
    this.candidateName = '';
    this.jobTitle = '';
    this.company = '';
    this.jobDescription = '';
    this.level = 'CONFIRME';
    this.questions = [];
    this.answers = [];
    this.currentQuestionIndex = 0;
    this.currentAnswer = '';
    this.isStarted = false;
    this.isCompleted = false;
    this.isLoading = false;
    this.isEvaluating = false;
    this.error = '';
    this.averageScore = 0;
  }
}
