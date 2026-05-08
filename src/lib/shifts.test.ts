import { createShift, updateShift, getShiftById, deleteShift } from '@/service/shift-service';
import { checkAuthorisation } from '@/session';
import { hasShiftStarted } from '@/utils/date';
import { getShiftTeamId, validateNewShift } from '@/validator/shift-validator';
import { revalidatePath } from 'next/cache';
import { redirect, notFound } from 'next/navigation';
import { getSaveShiftAction, getDeleteShiftAction } from './shifts';
import unauthorized from '@/app/unauthorized';

jest.mock('@/service/shift-service', () => ({
  createShift: jest.fn(),
  deleteShift: jest.fn(),
  getShiftById: jest.fn(),
  updateShift: jest.fn()
}));

jest.mock('@/session', () => ({
  checkAuthorisation: jest.fn()
}));

jest.mock('@/utils/date', () => ({
  hasShiftStarted: jest.fn()
}));

jest.mock('@/validator/shift-validator', () => ({
  getShiftTeamId: jest.fn(),
  validateNewShift: jest.fn()
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

jest.mock('@/app/unauthorized', () =>
  jest.fn(() => {
    throw new Error('unauthorized');
  })
);

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('redirect');
  }),
  notFound: jest.fn(() => {
    throw new Error('notFound');
  })
}));

const mockCheckAuthorisation = checkAuthorisation as jest.MockedFunction<typeof checkAuthorisation>;
const mockHasShiftStarted = hasShiftStarted as jest.MockedFunction<typeof hasShiftStarted>;
const mockGetShiftTeamId = getShiftTeamId as jest.MockedFunction<typeof getShiftTeamId>;
const mockValidateNewShift = validateNewShift as jest.MockedFunction<typeof validateNewShift>;
const mockCreateShift = createShift as jest.MockedFunction<typeof createShift>;
const mockUpdateShift = updateShift as jest.MockedFunction<typeof updateShift>;
const mockGetShiftById = getShiftById as jest.MockedFunction<typeof getShiftById>;
const mockDeleteShift = deleteShift as jest.MockedFunction<typeof deleteShift>;

const makeFormData = (values: Record<string, string | undefined>) =>
  ({
    get: (key: string) => values[key] ?? null
  }) as unknown as FormData;

describe('shifts actions', () => {
  const event = { id: 'event-1' } as any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCheckAuthorisation.mockResolvedValue(true);
    mockHasShiftStarted.mockReturnValue(false);
    mockGetShiftTeamId.mockReturnValue('team-1');
    mockValidateNewShift.mockReturnValue({ teamId: 'team-1' } as any);
  });

  describe('getSaveShiftAction', () => {
    test('creates a shift and redirects using string redirectUri', async () => {
      const saved = { id: 'shift-1', teamId: 'team-1' } as any;
      mockCreateShift.mockResolvedValue(saved);

      const action = getSaveShiftAction({
        isEditable: true,
        event,
        redirectUri: '/events/event-1/shifts'
      });

      await expect(action(makeFormData({ teamId: 'team-1' }))).rejects.toThrow('redirect');

      expect(mockCheckAuthorisation).toHaveBeenCalledWith([
        { type: 'admin' },
        { type: 'organiser', eventId: event.id },
        { type: 'team-lead', eventId: event.id, teamId: 'team-1' }
      ]);
      expect(mockCreateShift).toHaveBeenCalledWith({ teamId: 'team-1' });
      expect(mockUpdateShift).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/events/event-1/shifts');
      expect(redirect).toHaveBeenCalledWith('/events/event-1/shifts');
    });

    test('updates a shift and redirects using function redirectUri', async () => {
      const existing = { id: 'shift-1', teamId: 'team-1' } as any;
      const updated = { id: 'shift-1', teamId: 'team-1', role: 'Updated Role' } as any;
      mockGetShiftById.mockResolvedValue(existing);
      mockUpdateShift.mockResolvedValue(updated);
      mockValidateNewShift.mockReturnValue(updated);

      const redirectUri = jest.fn(async (shift: any) => `/events/event-1/shifts/${shift.id}`);

      const action = getSaveShiftAction({
        isEditable: true,
        event,
        redirectUri
      });

      await expect(action(makeFormData(updated))).rejects.toThrow('redirect');

      expect(mockUpdateShift).toHaveBeenCalledWith(updated);
      expect(mockCreateShift).not.toHaveBeenCalled();
      expect(redirectUri).toHaveBeenCalledWith(updated);
      expect(revalidatePath).toHaveBeenCalledWith('/events/event-1/shifts/shift-1');
      expect(redirect).toHaveBeenCalledWith('/events/event-1/shifts/shift-1');
    });

    test('throws unauthorized when event is not editable', async () => {
      const action = getSaveShiftAction({
        isEditable: false,
        event,
        redirectUri: '/x'
      });

      await expect(action(makeFormData({}))).rejects.toThrow('unauthorized');
      expect(unauthorized).toHaveBeenCalled();
      expect(mockCheckAuthorisation).not.toHaveBeenCalled();
    });

    test('throws unauthorized when existing shift has started', async () => {
      mockGetShiftById.mockResolvedValue({ id: 'shift-1', teamId: 'team-1' } as any);
      mockHasShiftStarted.mockReturnValue(true);

      const action = getSaveShiftAction({
        isEditable: true,
        event,
        redirectUri: '/x'
      });

      await expect(action(makeFormData({ id: 'shift-1' }))).rejects.toThrow('unauthorized');
      expect(unauthorized).toHaveBeenCalled();
      expect(mockUpdateShift).not.toHaveBeenCalled();
      expect(mockCreateShift).not.toHaveBeenCalled();
    });
  });

  describe('getDeleteShiftAction', () => {
    test('throws notFound when shiftId is missing', async () => {
      const action = getDeleteShiftAction({
        isEditable: true,
        event,
        redirectUri: '/x'
      });

      await expect(action('' as any)).rejects.toThrow('notFound');
      expect(notFound).toHaveBeenCalled();
    });

    test('throws unauthorized when event is not editable', async () => {
      const action = getDeleteShiftAction({
        isEditable: false,
        event,
        redirectUri: '/x'
      });

      await expect(action('shift-1')).rejects.toThrow('unauthorized');
      expect(unauthorized).toHaveBeenCalled();
    });

    test('throws notFound when shift does not exist', async () => {
      mockGetShiftById.mockResolvedValue(null);

      const action = getDeleteShiftAction({
        isEditable: true,
        event,
        redirectUri: '/x'
      });

      await expect(action('shift-404')).rejects.toThrow('notFound');
      expect(notFound).toHaveBeenCalled();
    });

    test('throws unauthorized when shift has started', async () => {
      mockGetShiftById.mockResolvedValue({ id: 'shift-1', teamId: 'team-9' } as any);
      mockHasShiftStarted.mockReturnValue(true);

      const action = getDeleteShiftAction({
        isEditable: true,
        event,
        redirectUri: '/x'
      });

      await expect(action('shift-1')).rejects.toThrow('unauthorized');
      expect(unauthorized).toHaveBeenCalled();
      expect(mockDeleteShift).not.toHaveBeenCalled();
    });

    test('deletes shift and revalidates using string redirectUri', async () => {
      const shift = { id: 'shift-1', teamId: 'team-9' } as any;
      mockGetShiftById.mockResolvedValue(shift);

      const action = getDeleteShiftAction({
        isEditable: true,
        event,
        redirectUri: '/events/event-1/shifts'
      });

      await action('shift-1');

      expect(checkAuthorisation).toHaveBeenCalledWith([
        { type: 'admin' },
        { type: 'organiser', eventId: event.id },
        { type: 'team-lead', eventId: event.id, teamId: 'team-9' }
      ]);
      expect(deleteShift).toHaveBeenCalledWith('shift-1');
      expect(revalidatePath).toHaveBeenCalledWith('/events/event-1/shifts');
    });

    test('deletes shift and revalidates using function redirectUri', async () => {
      const shift = { id: 'shift-2', teamId: 'team-2' } as any;
      mockGetShiftById.mockResolvedValue(shift);

      const redirectUri = jest.fn(async (s: any) => `/events/event-1/shifts/${s.id}`);

      const action = getDeleteShiftAction({
        isEditable: true,
        event,
        redirectUri
      });

      await action('shift-2');

      expect(deleteShift).toHaveBeenCalledWith('shift-2');
      expect(redirectUri).toHaveBeenCalledWith(shift);
      expect(revalidatePath).toHaveBeenCalledWith('/events/event-1/shifts/shift-2');
    });
  });
});
