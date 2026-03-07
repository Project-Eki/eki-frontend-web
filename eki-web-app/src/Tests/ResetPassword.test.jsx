import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import ResetPassword from '../pages/ResetPassword';

// Mock image imports (avoids Vite issues)
vi.mock('../assets/logo.jpeg', () => ({ default: 'logo.jpeg' }));
vi.mock('../assets/reset.jpeg', () => ({ default: 'reset.jpeg' }));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all form elements correctly', () => {
    render(<ResetPassword />);
    
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  test('shows error style when password is less than 8 characters', async () => {
    render(<ResetPassword />);

    const newPassword = screen.getByLabelText(/New Password/i);
    fireEvent.change(newPassword, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(newPassword).toHaveClass('border-red-500');
      expect(newPassword).toHaveAttribute('placeholder', 'Min. 8 characters');
    });
  });

  test('shows error when passwords do not match', async () => {
    render(<ResetPassword />);

    const newPassword = screen.getByLabelText(/New Password/i);
    const confirmPassword = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(newPassword, { target: { value: 'Password123' } });
    fireEvent.change(confirmPassword, { target: { value: 'Password456' } });

    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(confirmPassword).toHaveClass('border-red-500');
      expect(confirmPassword).toHaveAttribute('placeholder', 'Passwords must match');
    });
  });

  test('removes error when passwords match and meet requirements', async () => {
    render(<ResetPassword />);

    const newPassword = screen.getByLabelText(/New Password/i);
    const confirmPassword = screen.getByLabelText(/Confirm Password/i);

    fireEvent.change(newPassword, { target: { value: 'Password123' } });
    fireEvent.change(confirmPassword, { target: { value: 'Password123' } });

    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(newPassword).not.toHaveClass('border-red-500');
      expect(confirmPassword).not.toHaveClass('border-red-500');
    });
  });
});