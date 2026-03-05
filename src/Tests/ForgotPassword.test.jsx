import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import ForgotPassword from '../pages/ForgotPassword'; 


vi.mock('../assets/logo.jpeg', () => ({ default: 'logo.jpeg' }));
vi.mock('../assets/reset.jpeg', () => ({ default: 'reset.jpeg' }));

describe('ForgotPassword Component', () => {
  const mockOnBackToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page correctly', () => {
    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Sign in/i })).toBeInTheDocument();
  });

  test('shows error when email is empty', async () => {
    render(<ForgotPassword />);
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    const input = screen.getByRole('textbox');
    await waitFor(() => {
      expect(input).toHaveAttribute('placeholder', 'Email is required');
      expect(input).toHaveClass('border-red-500');
    });
  });

  test('shows error for invalid email', async () => {
    render(<ForgotPassword />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    await waitFor(() => {
      expect(input).toHaveAttribute('placeholder', 'Invalid email address');
      expect(input).toHaveClass('border-red-500');
    });
  });

  test('clears error when valid email is submitted', async () => {
    render(<ForgotPassword />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    await waitFor(() => {
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).not.toHaveClass('border-red-500');
    });
  });

  test('calls onBackToLogin when clicked', () => {
    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    fireEvent.click(screen.getByRole('button', { name: /Back to Sign in/i }));
    expect(mockOnBackToLogin).toHaveBeenCalledTimes(1);
  });
});