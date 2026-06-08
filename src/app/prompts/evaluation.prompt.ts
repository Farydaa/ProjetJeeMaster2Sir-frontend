/**
 * Prompt pour l'évaluation des réponses du candidat avec Gemini
 */

export const EVALUATION_PROMPT = `Tu es un expert en évaluation de candidats lors d'entretiens d'embauche.

QUESTION POSÉE:
{question}

RÉPONSE DU CANDIDAT:
{answer}

COMPÉTENCES REQUISES:
{requiredSkills}

TÂCHE:
Évalue cette réponse sur une échelle de 0 à 100 avec justification.

CRITÈRES D'ÉVALUATION:
- Pertinence: la réponse répond-elle à la question?
- Complétude: la réponse est-elle complète?
- Clarté: la réponse est-elle claire et structurée?
- Exemples concrets: y a-t-il des exemples?
- Compétences techniques: les compétences requises sont-elles démontrées?

RÉPONSE UNIQUEMENT EN JSON VALIDE (sans markdown):
{
  "score": 75,
  "justification": "La réponse est pertinente et bien structurée...",
  "points_forts": ["point1", "point2"],
  "axes_amelioration": ["point1", "point2"],
  "competences_demontrees": ["competence1", "competence2"]
}`;

export function buildEvaluationPrompt(
  question: string,
  answer: string,
  requiredSkills: string[]
): string {
  return EVALUATION_PROMPT
    .replace('{question}', question)
    .replace('{answer}', answer)
    .replace('{requiredSkills}', requiredSkills.join(', '));
}
