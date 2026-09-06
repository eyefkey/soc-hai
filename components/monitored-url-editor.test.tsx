import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const updateMonitoredUrl = vi.fn().mockResolvedValue({});
vi.mock('@/app/actions/assets', () => ({
  updateMonitoredUrl: (...args: unknown[]) => updateMonitoredUrl(...args),
}));

import { MonitoredUrlEditor } from './monitored-url-editor';

describe('MonitoredUrlEditor', () => {
  it('renders as read-only text for a viewer, with no edit affordance', () => {
    render(
      <MonitoredUrlEditor
        assetId="asset-1"
        monitoredUrl="https://example.com"
        canWrite={false}
      />,
    );

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows "Not monitored" for a viewer when no URL is set', () => {
    render(<MonitoredUrlEditor assetId="asset-1" monitoredUrl={null} canWrite={false} />);

    expect(screen.getByText('Not monitored')).toBeInTheDocument();
  });

  it('renders a clickable button for a writer, showing the current value', () => {
    render(
      <MonitoredUrlEditor
        assetId="asset-1"
        monitoredUrl="https://example.com"
        canWrite={true}
      />,
    );

    expect(screen.getByRole('button', { name: /example\.com/ })).toBeInTheDocument();
  });

  it('opens an editable input on click, pre-filled with the current value', async () => {
    const user = userEvent.setup();
    render(
      <MonitoredUrlEditor
        assetId="asset-1"
        monitoredUrl="https://example.com"
        canWrite={true}
      />,
    );

    await user.click(screen.getByRole('button'));

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toHaveValue('https://example.com');
  });

  it('closes the editor on Escape without submitting', async () => {
    const user = userEvent.setup();
    render(
      <MonitoredUrlEditor
        assetId="asset-1"
        monitoredUrl="https://example.com"
        canWrite={true}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(updateMonitoredUrl).not.toHaveBeenCalled();
  });

  it('submits the new value bound to the asset id', async () => {
    const user = userEvent.setup();
    render(
      <MonitoredUrlEditor assetId="asset-42" monitoredUrl={null} canWrite={true} />,
    );

    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('textbox'), 'https://new-site.example.com');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(updateMonitoredUrl).toHaveBeenCalledWith(
      'asset-42',
      expect.anything(),
      expect.any(FormData),
    );
  });
});
