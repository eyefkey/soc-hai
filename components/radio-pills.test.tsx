import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RadioPills } from './radio-pills';

describe('RadioPills', () => {
  it('renders one radio option per value, with underscores turned into spaces', () => {
    render(<RadioPills name="severity" options={['LOW', 'HIGH_ALERT']} />);

    expect(screen.getByText('LOW')).toBeInTheDocument();
    expect(screen.getByText('HIGH ALERT')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('pre-selects defaultValue', () => {
    render(<RadioPills name="severity" options={['LOW', 'HIGH']} defaultValue="HIGH" />);

    expect(screen.getByRole('radio', { name: 'HIGH' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'LOW' })).not.toBeChecked();
  });

  it('is a single-select group: choosing one option unchecks the other', async () => {
    const user = userEvent.setup();
    render(<RadioPills name="severity" options={['LOW', 'HIGH']} />);

    await user.click(screen.getByRole('radio', { name: 'LOW' }));
    expect(screen.getByRole('radio', { name: 'LOW' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'HIGH' }));
    expect(screen.getByRole('radio', { name: 'HIGH' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'LOW' })).not.toBeChecked();
  });

  it('marks every input required when required is set, matching native radio-group validation', () => {
    render(<RadioPills name="severity" options={['LOW', 'HIGH']} required />);

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeRequired();
    }
  });

  it('shares the same name across options so only one submits with the form', () => {
    render(<RadioPills name="severity" options={['LOW', 'HIGH']} />);

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('name', 'severity');
    }
  });
});
