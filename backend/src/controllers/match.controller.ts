import { Request, Response } from 'express';
import { DBAuthenticatedRequest } from '../middleware/role.middleware.js';
import { matchService } from '../services/match.service.js';
import { Prisma } from '@prisma/client';

export const createMatch = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, sportId, skillLevel, maxPlayers, description, visibility } = req.body;
    const userId = req.dbUser!.id;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }
    if (!sportId) {
      return res.status(400).json({ error: 'sportId is required' });
    }
    if (maxPlayers === undefined) {
      return res.status(400).json({ error: 'maxPlayers is required' });
    }

    const match = await matchService.createMatch(userId, {
      bookingId,
      sportId,
      skillLevel,
      maxPlayers: Number(maxPlayers),
      description,
      visibility,
    });

    res.status(201).json(match);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'A match already exists for this booking' });
    }

    const message = error.message;

    if (
      message.includes('not found') ||
      message.includes('Booking not found') ||
      message.includes('Sport not found')
    ) {
      return res.status(404).json({ error: message });
    }

    if (message.includes('Unauthorized')) {
      return res.status(403).json({ error: message });
    }

    if (
      message.includes('already exists') ||
      message.includes('at least 2 players') ||
      message.includes('not confirmed') ||
      message.includes('in the past')
    ) {
      return res.status(400).json({ error: message });
    }

    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await matchService.getMatchById(id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.status(200).json(match);
  } catch (error) {
    console.error('Error fetching match details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { sportId, skillLevel, status, page, limit } = req.query;

    const pageVal = page ? Number(page) : 1;
    const limitVal = limit ? Number(limit) : 10;

    if (page && (!Number.isInteger(pageVal) || pageVal < 1)) {
      return res.status(400).json({ error: 'Page must be a positive integer' });
    }
    if (limit && (!Number.isInteger(limitVal) || limitVal < 1 || limitVal > 100)) {
      return res.status(400).json({ error: 'Limit must be a positive integer between 1 and 100' });
    }

    const result = await matchService.listMatches({
      sportId: sportId as string,
      skillLevel: skillLevel as any,
      status: status as any,
      page: pageVal,
      limit: limitVal,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error listing matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyHosted = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const userId = req.dbUser!.id;
    const matches = await matchService.getMyHostedMatches(userId);
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching hosted matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyJoined = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const userId = req.dbUser!.id;
    const matches = await matchService.getMyJoinedMatches(userId);
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching joined matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const join = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    const updatedMatch = await matchService.joinMatch(id, userId);
    res.status(200).json(updatedMatch);
  } catch (error: any) {
    const message = error.message;

    if (message === 'Match not found') {
      return res.status(404).json({ error: message });
    }

    if (message === 'Already joined this match') {
      return res.status(409).json({ error: message });
    }

    if (
      message === 'Match is full' ||
      message.includes('not open for joining') ||
      message.includes('already started')
    ) {
      return res.status(400).json({ error: message });
    }

    console.error('Error joining match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const leave = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    const updatedMatch = await matchService.leaveMatch(id, userId);
    res.status(200).json(updatedMatch);
  } catch (error: any) {
    const message = error.message;

    if (message === 'Match not found') {
      return res.status(404).json({ error: message });
    }

    if (
      message.includes('Not a participant') ||
      message.includes('Host cannot leave') ||
      message.includes('Cannot leave')
    ) {
      return res.status(400).json({ error: message });
    }

    console.error('Error leaving match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const start = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    const updatedMatch = await matchService.startMatch(id, userId);
    res.status(200).json(updatedMatch);
  } catch (error: any) {
    const message = error.message;

    if (message === 'Match not found') {
      return res.status(404).json({ error: message });
    }

    if (message.includes('Unauthorized')) {
      return res.status(403).json({ error: message });
    }

    if (message.includes('Cannot start')) {
      return res.status(400).json({ error: message });
    }

    console.error('Error starting match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancel = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;
    const { reason } = req.body;

    const updatedMatch = await matchService.cancelMatch(id, userId, reason);
    res.status(200).json(updatedMatch);
  } catch (error: any) {
    const message = error.message;

    if (message === 'Match not found') {
      return res.status(404).json({ error: message });
    }

    if (message.includes('Unauthorized')) {
      return res.status(403).json({ error: message });
    }

    if (message.includes('Cannot cancel')) {
      return res.status(400).json({ error: message });
    }

    console.error('Error cancelling match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const complete = async (req: DBAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    const updatedMatch = await matchService.completeMatch(id, userId);
    res.status(200).json(updatedMatch);
  } catch (error: any) {
    const message = error.message;

    if (message === 'Match not found') {
      return res.status(404).json({ error: message });
    }

    if (message.includes('Unauthorized')) {
      return res.status(403).json({ error: message });
    }

    if (message.includes('Only matches in progress')) {
      return res.status(400).json({ error: message });
    }

    console.error('Error completing match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
