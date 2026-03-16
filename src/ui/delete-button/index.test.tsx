import { render, screen, fireEvent, waitFor } from '@/test-utils';
import DeleteButton from './index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('DeleteButton', () => {
  const mockOnDelete = jest.fn().mockResolvedValue(undefined);

  it('renders the delete button with the trash icon', () => {
    render(
      <DeleteButton
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
  });

  it('opens the confirmation dialog when the delete button is clicked', () => {
    render(
      <DeleteButton
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('calls onDelete and closes the dialog when the delete button in the dialog is clicked', async () => {
    render(
      <DeleteButton
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '' }));
    const deleteButton = screen.getByRole('button', { name: 'delete' });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });
  });

  it('closes the dialog when the cancel button is clicked', () => {
    render(
      <DeleteButton
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '' }));
    const cancelButton = screen.getByRole('button', { name: 'cancel' });

    fireEvent.click(cancelButton);

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });
});
