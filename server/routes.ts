import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { rankTalents, recommendSkills } from "./ai-service"; // Import recommendSkills
import { insertEndorsementSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/talents", async (req, res) => {
    const talents = await storage.getAllTalents();
    res.json(talents);
  });

  app.get("/api/talents/:id/tokens", async (req, res) => {
    const tokens = await storage.getTalentTokens(parseInt(req.params.id));
    if (!tokens) return res.status(404).send("Token not found");
    res.json(tokens);
  });

  app.get("/api/talents/ranked", async (req, res) => {
    try {
      const talents = await storage.getAllTalents();

      // Fetch all tokens in parallel
      const tokenPromises = talents.map(talent => storage.getTalentTokens(talent.id));
      const tokenResults = await Promise.all(tokenPromises);

      const tokens = tokenResults.reduce((acc, token, i) => ({
        ...acc,
        [talents[i].id]: token
      }), {});

      const rankings = await rankTalents(talents, tokens);
      res.json(rankings);
    } catch (error) {
      console.error('Error ranking talents:', error);
      if (error instanceof Error) {
        res.status(500).send(error.message);
      } else {
        res.status(500).send("Failed to rank talents");
      }
    }
  });

  app.get("/api/investments/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const investments = await storage.getInvestments(parseInt(req.params.userId));
    res.json(investments);
  });

  app.patch("/api/talents/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.id !== parseInt(req.params.id)) {
      return res.status(401).send("Unauthorized");
    }
    const updatedUser = await storage.updateUser(parseInt(req.params.id), req.body);
    res.json(updatedUser);
  });

  // New endorsement routes
  app.post("/api/talents/:id/endorsements", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("You must be logged in to endorse skills");
    }

    try {
      const endorsementData = insertEndorsementSchema.parse({
        ...req.body,
        talentId: parseInt(req.params.id),
        endorserId: req.user.id,
      });

      const talent = await storage.getUser(endorsementData.talentId);
      if (!talent || talent.role !== "talent") {
        return res.status(404).send("Talent not found");
      }

      // Check if the skill exists in talent's skills
      if (!talent.skills?.includes(endorsementData.skill)) {
        return res.status(400).send("This skill is not listed in the talent's profile");
      }

      const endorsement = await storage.createEndorsement(endorsementData);
      res.status(201).json(endorsement);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid endorsement data" });
      }
    }
  });

  app.get("/api/talents/:id/endorsements", async (req, res) => {
    const endorsements = await storage.getEndorsementsForTalent(parseInt(req.params.id));
    res.json(endorsements);
  });

  app.get("/api/talents/:id/endorsements/:skill", async (req, res) => {
    const endorsements = await storage.getEndorsementsBySkill(
      parseInt(req.params.id),
      req.params.skill
    );
    res.json(endorsements);
  });

  // Add this route after the other talent endpoints
  app.get("/api/talents/:id/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("You must be logged in to view recommendations");
    }

    try {
      const talent = await storage.getUser(parseInt(req.params.id));
      if (!talent || talent.role !== "talent") {
        return res.status(404).send("Talent not found");
      }

      const recommendations = await recommendSkills(talent);
      res.json(recommendations);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send(error.message);
      } else {
        res.status(500).send("Failed to get skill recommendations");
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}