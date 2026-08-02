import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requirePlayer } from '../middleware/role.middleware.js';
import {
  createMatch,
  getMatch,
  getMatches,
  getMyHosted,
  getMyJoined,
  join,
  leave,
  start,
  cancel,
  complete
} from '../controllers/match.controller.js';

const router = Router();

// Public read routes
router.get('/', getMatches);
router.get('/:id', getMatch);

// Authenticated routes
router.use(requireAuth);

router.post('/', requirePlayer, createMatch);
router.get('/my-hosted', requirePlayer, getMyHosted);
router.get('/my-joined', requirePlayer, getMyJoined);
router.post('/:id/join', requirePlayer, join);
router.delete('/:id/leave', requirePlayer, leave);
router.patch('/:id/start', requirePlayer, start);
router.patch('/:id/cancel', requirePlayer, cancel);
router.patch('/:id/complete', requirePlayer, complete);

export default router;
