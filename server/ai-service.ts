import OpenAI from "openai";
import { User, TalentToken } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TalentScore {
  score: number;
  confidence: number;
  reasoning: string;
}

interface SkillRecommendation {
  skill: string;
  reason: string;
  confidence: number;
}

export async function rankTalent(talent: User, token?: TalentToken): Promise<TalentScore> {
  try {
    const prompt = `
      Analyze this talent's profile and provide a ranking score:

      Name: ${talent.name || talent.username}
      Bio: ${talent.bio || 'No bio provided'}
      Skills: ${talent.skills?.join(', ') || 'No skills listed'}
      Portfolio: ${talent.portfolio || 'No portfolio provided'}
      ${token ? `
      Goals: ${(token.goals as string[]).join(', ')}
      Milestones: ${(token.milestones as string[]).join(', ')}
      ` : ''}

      Based on the above information, analyze the talent's potential and current achievements.
      Respond with a JSON object containing:
      - score (number between 0-100)
      - confidence (number between 0-1)
      - reasoning (string explaining the ranking)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: "You are a talent assessment expert. Analyze talent profiles and provide numerical rankings based on their skills, experience, and achievements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return {
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('Error ranking talent:', error);
    return {
      score: 0,
      confidence: 0,
      reasoning: 'Failed to analyze talent profile'
    };
  }
}

export async function recommendSkills(talent: User): Promise<SkillRecommendation[]> {
  try {
    const prompt = `
      Based on this talent's profile, recommend additional skills they should learn:

      Current Skills: ${talent.skills?.join(', ') || 'No skills listed'}
      Bio: ${talent.bio || 'No bio provided'}
      Portfolio: ${talent.portfolio || 'No portfolio provided'}

      Analyze their current skills and suggest 3 new skills they should learn to enhance their career prospects.
      For each skill, explain why it would be valuable based on their current profile.

      Respond with a JSON array of objects, each containing:
      - skill (string): The recommended skill name
      - reason (string): Why this skill would be valuable
      - confidence (number): Confidence in this recommendation (0-1)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: "You are a career development expert specializing in technology and skill recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.recommendations.map((rec: any) => ({
      skill: rec.skill,
      reason: rec.reason,
      confidence: Math.max(0, Math.min(1, rec.confidence))
    }));
  } catch (error) {
    console.error('Error recommending skills:', error);
    return [];
  }
}

export async function rankTalents(talents: User[], tokens: { [key: number]: TalentToken }): Promise<{ [key: number]: TalentScore }> {
  const rankings: { [key: number]: TalentScore } = {};

  for (const talent of talents) {
    const token = tokens[talent.id];
    rankings[talent.id] = await rankTalent(talent, token);
  }

  return rankings;
}