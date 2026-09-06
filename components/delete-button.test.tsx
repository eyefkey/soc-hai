import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args), success: (...args: unknown[]) => toastSuccess(...args) },
}));

import { DeleteButton } from './delete-button';

/*
 * The arm/confirm toggle replaced window.confirm() specifically because
 * browser automation was answering native dialogs false, making the
 * confirmed path untestable (see the component's own comment) — these
 * tests exist to make sure that path stays exercised going forward.
 */
describe('DeleteButton', () => {
  beforeEach(() => {
    refresh.mockClear();
    toastError.mockClear();
    toastSuccess.mockClear();
  });

  it('starts disarmed, showing the plain action label', () => {
    render(<DeleteButton action={async () => ({})} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('uses the unlink label and copy for the unlink variant', () => {
    render(<DeleteButton action={async () => ({})} variant="unlink" />);

    expect(screen.getByRole('button', { name: /unlink/i })).toBeInTheDocument();
  });

  it('arms on first click, showing Confirm and a cancel button, without calling the action yet', async () => {
    const action = vi.fn().mockResolvedValue({});
    const user = userEvent.setup();
    render(<DeleteButton action={action} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it('disarms back to the plain label when the cancel (X) button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteButton action={async () => ({})} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    const buttons = screen.getAllByRole('button');
    // The cancel button is the icon-only one alongside Confirm.
    await user.click(buttons[buttons.length - 1]);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('calls the action and shows a success toast + router.refresh on Confirm', async () => {
    const action = vi.fn().mockResolvedValue({});
    const user = userEvent.setup();
    render(<DeleteButton action={action} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Deleted.'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shows an error toast and does not refresh when the action fails', async () => {
    const action = vi.fn().mockResolvedValue({ error: 'Your role does not allow this action.' });
    const user = userEvent.setup();
    render(<DeleteButton action={action} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Your role does not allow this action.'),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it('auto-disarms after the timeout so a stale confirm cannot be clicked later', () => {
    vi.useFakeTimers();
    try {
      render(<DeleteButton action={async () => ({})} />);

      // fireEvent instead of userEvent: userEvent's internal pointer timers
      // don't play well with fake timers, and arming is a plain synchronous
      // click handler, so fireEvent is a faithful, simpler stand-in here.
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
