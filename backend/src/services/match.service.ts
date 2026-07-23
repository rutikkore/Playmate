import { MatchStatus, SkillLevel, ParticipantRole, MatchVisibility } from '@prisma/client';
import { prisma } from '../config/db.js';
import { isPastSlot } from '../utils/date.utils.js';

export const matchService = {
  /**
   * Creates a new match and adds the host as the first participant.
   */
  async createMatch(
    userId: string,
    data: {
      bookingId: string;
      sportId: string;
      skillLevel?: SkillLevel;
      maxPlayers: number;
      description?: string;
      visibility?: MatchVisibility;
    }
  ) {
    if (data.maxPlayers < 2) {
      throw new Error('Match must support at least 2 players');
    }

    // 1. Fetch booking with its slot to perform validations
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { slot: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // 2. Validate booking ownership
    if (booking.userId !== userId) {
      throw new Error('Unauthorized: You do not own this booking');
    }

    // 3. Validate booking status is CONFIRMED
    if (booking.status !== 'CONFIRMED') {
      throw new Error('Cannot host a match for a booking that is not confirmed');
    }

    // 4. Validate slot is in the future
    if (isPastSlot(booking.slot.date, booking.slot.startTime)) {
      throw new Error('Cannot host a match for a booking in the past');
    }

    // 5. Verify booking does not already have a match
    const existingMatch = await prisma.match.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingMatch) {
      throw new Error('A match already exists for this booking');
    }

    // 6. Verify sport exists
    const sportExists = await prisma.sport.findUnique({
      where: { id: data.sportId },
    });

    if (!sportExists) {
      throw new Error('Sport not found');
    }

    // 7. Create Match and add host as participant in a transaction
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          bookingId: data.bookingId,
          hostId: userId,
          sportId: data.sportId,
          description: data.description,
          skillLevel: data.skillLevel ?? SkillLevel.MIXED,
          maxPlayers: data.maxPlayers,
          participantCount: 1, // Host is the first participant
          visibility: data.visibility ?? MatchVisibility.PUBLIC,
          status: MatchStatus.OPEN,
        },
      });

      await tx.matchParticipant.create({
        data: {
          matchId: match.id,
          userId: userId,
          role: ParticipantRole.HOST,
        },
      });

      return match;
    });
  },

  /**
   * Retrieves a single match by ID with all relations.
   * Excludes sensitive user data (like email).
   */
  async getMatchById(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        booking: {
          include: {
            turf: true,
            slot: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            role: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                role: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    return match;
  },

  /**
   * Lists matches with pagination and filtering.
   * Defaults to showing OPEN/FULL public matches.
   * Excludes sensitive user data (like email).
   */
  async listMatches(filters: {
    sportId?: string;
    skillLevel?: SkillLevel;
    status?: MatchStatus;
    page?: number;
    limit?: number;
  }) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      visibility: MatchVisibility.PUBLIC,
    };

    if (filters.sportId) {
      whereClause.sportId = filters.sportId;
    }

    if (filters.skillLevel) {
      whereClause.skillLevel = filters.skillLevel;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    } else {
      // Default: show only active matches
      whereClause.status = {
        in: [MatchStatus.OPEN, MatchStatus.FULL],
      };
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              turf: true,
              slot: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
              role: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  photoUrl: true,
                  role: true,
                },
              },
            },
            orderBy: {
              joinedAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.match.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      matches,
      total,
      page,
      limit,
      totalPages,
    };
  },

  /**
   * Retrieves matches hosted by the user.
   * Excludes sensitive user data.
   */
  async getMyHostedMatches(userId: string) {
    return prisma.match.findMany({
      where: { hostId: userId },
      include: {
        booking: {
          include: {
            turf: true,
            slot: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            role: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Retrieves matches joined by the user.
   * Excludes sensitive user data.
   */
  async getMyJoinedMatches(userId: string) {
    return prisma.match.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        booking: {
          include: {
            turf: true,
            slot: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            role: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Adds a player to a match inside a Prisma transaction with Optimistic Concurrency Control.
   */
  async joinMatch(matchId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch match with slot info
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          booking: {
            include: { slot: true },
          },
        },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // 2. Validate match status is OPEN
      if (match.status !== MatchStatus.OPEN) {
        if (match.status === MatchStatus.FULL) {
          throw new Error('Match is full');
        }
        throw new Error('Match is not open for joining');
      }

      // 3. Validate slot is in the future
      if (isPastSlot(match.booking.slot.date, match.booking.slot.startTime)) {
        throw new Error('Cannot join a match that has already started/ended');
      }

      // 4. Enforce capacity limit
      if (match.participantCount >= match.maxPlayers) {
        throw new Error('Match is full');
      }

      // 5. Host rejoin guard: Host cannot join as player
      if (match.hostId === userId) {
        throw new Error('Host is already a participant and cannot rejoin');
      }

      // 6. Prevent duplicate joins
      const existingParticipant = await tx.matchParticipant.findUnique({
        where: {
          matchId_userId: {
            matchId,
            userId,
          },
        },
      });

      if (existingParticipant) {
        throw new Error('Already joined this match');
      }

      // 7. Create participant record
      await tx.matchParticipant.create({
        data: {
          matchId,
          userId,
          role: ParticipantRole.PLAYER,
        },
      });

      // 8. Optimistic Concurrency Control: Update match participantCount and status.
      // We filter by current participantCount. If it has been changed by another
      // transaction, updateMany will update 0 rows, triggering a rollback.
      const newParticipantCount = match.participantCount + 1;
      const statusToSet = newParticipantCount === match.maxPlayers ? MatchStatus.FULL : MatchStatus.OPEN;

      const updateResult = await tx.match.updateMany({
        where: {
          id: matchId,
          participantCount: match.participantCount,
        },
        data: {
          participantCount: newParticipantCount,
          status: statusToSet,
        },
      });

      if (updateResult.count === 0) {
        throw new Error('Match capacity was updated by another request. Please try again.');
      }

      // Fetch and return the updated match
      const finalMatch = await tx.match.findUnique({
        where: { id: matchId },
      });

      return finalMatch!;
    });
  },

  /**
   * Removes a player from a match inside a Prisma transaction with Optimistic Concurrency Control.
   */
  async leaveMatch(matchId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch match
      const match = await tx.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // 2. Validate match status is OPEN or FULL
      if (match.status !== MatchStatus.OPEN && match.status !== MatchStatus.FULL) {
        throw new Error('Cannot leave a match that has already started, completed, or cancelled');
      }

      // 3. Verify user is a participant
      const participant = await tx.matchParticipant.findUnique({
        where: {
          matchId_userId: {
            matchId,
            userId,
          },
        },
      });

      if (!participant) {
        throw new Error('Not a participant in this match');
      }

      // 4. Host cannot leave
      if (participant.role === ParticipantRole.HOST || match.hostId === userId) {
        throw new Error('Host cannot leave the match. You must cancel it instead.');
      }

      // 5. Remove participant
      await tx.matchParticipant.delete({
        where: {
          matchId_userId: {
            matchId,
            userId,
          },
        },
      });

      // 6. Optimistic Concurrency Control: Decrement count and reset status.
      // We filter by current participantCount to protect against concurrent leaves/joins.
      const newParticipantCount = match.participantCount - 1;

      const updateResult = await tx.match.updateMany({
        where: {
          id: matchId,
          participantCount: match.participantCount,
        },
        data: {
          participantCount: newParticipantCount,
          status: MatchStatus.OPEN, // Always set to OPEN when someone leaves since count drops below max
        },
      });

      if (updateResult.count === 0) {
        throw new Error('Match capacity was updated by another request. Please try again.');
      }

      const finalMatch = await tx.match.findUnique({
        where: { id: matchId },
      });

      return finalMatch!;
    });
  },

  /**
   * Starts a match (host only).
   * Lifecycle transition: OPEN/FULL -> IN_PROGRESS
   */
  async startMatch(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.hostId !== userId) {
      throw new Error('Unauthorized to start this match');
    }

    if (match.status !== MatchStatus.OPEN && match.status !== MatchStatus.FULL) {
      throw new Error('Cannot start a match that is not open or full');
    }

    return prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.IN_PROGRESS },
    });
  },

  /**
   * Cancels a match (host only).
   * Lifecycle transition: OPEN/FULL/IN_PROGRESS -> CANCELLED
   */
  async cancelMatch(matchId: string, userId: string, reason?: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.hostId !== userId) {
      throw new Error('Unauthorized to cancel this match');
    }

    if (match.status === MatchStatus.CANCELLED || match.status === MatchStatus.COMPLETED) {
      throw new Error('Cannot cancel a finished match');
    }

    return prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason || null,
      },
    });
  },

  /**
   * Completes a match (host only).
   * Lifecycle transition: IN_PROGRESS -> COMPLETED
   */
  async completeMatch(matchId: string, userId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.hostId !== userId) {
      throw new Error('Unauthorized to complete this match');
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new Error('Only matches in progress can be completed');
    }

    return prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.COMPLETED },
    });
  },
};
