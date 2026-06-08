/**
 * Prompt pour la génération de questions d'entretien avec Gemini
 */

export const QUESTION_GENERATION_PROMPT = `Tu es un expert en recrutement avec 15 ans d'expérience.

CONTEXTE:
- Poste: {jobTitle}
- Entreprise: {company}
- Niveau requis: {level}
- Description du poste: {jobDescription}

TÂCHE:
Génère exactement 5 questions d'entretien professionnelles qui couvrent:
1. Compétences techniques (2 questions)
2. Compétences comportementales (2 questions)
3. Adéquation culturelle (1 question)

CRITÈRES:
- Questions spécifiques au poste et à l'entreprise
- Variées en difficulté
- Orientées vers l'évaluation concrète des compétences
- Professionnelles et respectueuses

RÉPONSE UNIQUEMENT EN JSON VALIDE (sans markdown):
{
  "questions": [
    {
      "content": "texte de la question",
      "category": "TECHNICAL|BEHAVIORAL|CULTURAL",
      "requiredSkills": ["skill1", "skill2"],
      "difficulty": "EASY|MEDIUM|HARD"
    }
  ]
}`;

export function buildQuestionPrompt(
  jobTitle: string,
  company: string,
  jobDescription: string,
  level: string
): string {
  return QUESTION_GENERATION_PROMPT
    .replace('{jobTitle}', jobTitle)
    .replace('{company}', company)
    .replace('{jobDescription}', jobDescription)
    .replace('{level}', level);
}
