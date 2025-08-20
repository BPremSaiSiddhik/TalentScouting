import { User, InsertUser, TalentToken, Investment, SkillEndorsement, InsertEndorsement } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";
import { users, talentTokens, investments, skillEndorsements } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getTalentTokens(talentId: number): Promise<TalentToken | undefined>;
  getInvestments(userId: number): Promise<Investment[]>;
  getAllTalents(): Promise<User[]>;
  createEndorsement(endorsement: InsertEndorsement): Promise<SkillEndorsement>;
  getEndorsementsForTalent(talentId: number): Promise<SkillEndorsement[]>;
  getEndorsementsBySkill(talentId: number, skill: string): Promise<SkillEndorsement[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();

    // If user is talent, create their token
    if (user.role === "talent") {
      await db.insert(talentTokens).values({
        talentId: user.id,
        totalSupply: 1000000,
        currentPrice: 100,
        goals: ["Become a top AI researcher", "Launch startup"],
        milestones: ["Completed AI certification", "Built MVP"],
      });
    }

    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getTalentTokens(talentId: number): Promise<TalentToken | undefined> {
    const [token] = await db
      .select()
      .from(talentTokens)
      .where(eq(talentTokens.talentId, talentId));
    return token;
  }

  async getInvestments(userId: number): Promise<Investment[]> {
    return await db
      .select()
      .from(investments)
      .where(
        or(
          eq(investments.investorId, userId),
          eq(investments.talentId, userId)
        )
      );
  }

  async getAllTalents(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "talent"));
  }

  async createEndorsement(endorsement: InsertEndorsement): Promise<SkillEndorsement> {
    const [result] = await db
      .insert(skillEndorsements)
      .values({
        ...endorsement,
        timestamp: new Date(),
      })
      .returning();
    return result;
  }

  async getEndorsementsForTalent(talentId: number): Promise<SkillEndorsement[]> {
    return await db
      .select()
      .from(skillEndorsements)
      .where(eq(skillEndorsements.talentId, talentId));
  }

  async getEndorsementsBySkill(talentId: number, skill: string): Promise<SkillEndorsement[]> {
    return await db
      .select()
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.talentId, talentId),
          eq(skillEndorsements.skill, skill)
        )
      );
  }
}

export const storage = new DatabaseStorage();