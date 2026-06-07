/**
 * Prompt pour la génération du rapport final d'entretien avec Gemini
 */

export const REPORT_GENERATION_PROMPT = `Tu es un expert en recrutement et en analyse de profils candidats.

INFORMATIONS DU CANDIDAT:
- Nom: {candidateName}
- Poste visé: {jobTitle}
- Entreprise: {company}
- Niveau: {level}

DÉTAILS DE L'ENTRETIEN:
- Nombre de questions: {questionCount}
- Score moyen: {averageScore}/100
- Date: {interviewDate}

RÉSULTATS DES RÉPONSES:
{questionResults}

COMPÉTENCES DÉMONTRÉES:
{demonstratedSkills}

TÂCHE:
Génère un rapport professionnel qui synthétise l'entretien et donne une recommandation d'embauche.

Le rapport doit inclure:
1. Résumé exécutif (3-4 phrases)
2. Analyse détaillée par catégorie (technique, comportementale, culturelle)
3. Recommandation finale (HIRE, CONSIDER, ou REJECT)
4. Plan de développement suggéré (3-4 actions)

RÉPONSE UNIQUEMENT EN JSON VALIDE (sans markdown):
{
  "executiveSummary": "...",
  "detailedAnalysis": {
    "technicalSkills": { "score": 80, "comments": "..." },
    "behavioralSkills": { "score": 75, "comments": "..." },
    "culturalFit": { "score": 85, "comments": "..." }
  },
  "recommendation": "HIRE|CONSIDER|REJECT",
  "recommendationJustification": "...",
  "developmentPlan": ["action1", "action2"],
  "overallScore": 80
}`;

export function buildReportPrompt(
  candidateName: string,
  jobTitle: string,
  company: string,
  level: string,
  questionCount: number,
  averageScore: number,
  interviewDate: string,
  questionResults: string,
  demonstratedSkills: string[]
): string {
  return REPORT_GENERATION_PROMPT
    .replace('{candidateName}', candidateName)
    .replace('{jobTitle}', jobTitle)
    .replace('{company}', company)
    .replace('{level}', level)
    .replace('{questionCount}', questionCount.toString())
    .replace('{averageScore}', averageScore.toFixed(1))
    .replace('{interviewDate}', interviewDate)
    .replace('{questionResults}', questionResults)
    .replace('{demonstratedSkills}', demonstratedSkills.join(', '));
}
