import pool from '@/db';

export const getShiftsAssignedToUser = async (userId: UserId): Promise<ShiftAssignment[]> => {
  const result = await pool.query(
    `SELECT sa.id, sa."userId", sa."shiftId", s."startTime", s."endTime"
     FROM "shiftAssignment" sa
     JOIN "shift" s ON s.id = sa."shiftId"
     WHERE sa."userId" = $1`,
    [userId]
  );
  return result.rows;
};
