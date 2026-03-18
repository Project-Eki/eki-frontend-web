import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';
import { passwordResetRequest } from '../services/api';


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


vi.mock('../services/api', () => ({
  passwordResetRequest: vi.fn(),
}));

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  test('renders page correctly', () => {
    renderComponent();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
   
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  test('shows error in placeholder when email is empty', async () => {
    renderComponent();
    const submitBtn = screen.getByRole('button', { name: /Reset Password/i });
    
    fireEvent.click(submitBtn);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Email is required');
    expect(input).toHaveClass('border-red-500');
  });

  test('shows error for invalid email format', async () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    const submitBtn = screen.getByRole('button', { name: /Reset Password/i });

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(submitBtn);

    expect(input).toHaveAttribute('placeholder', 'Invalid email address');
    expect(input.value).toBe(''); 
  });

  test('successful submission navigates to reset-password', async () => {
   
    passwordResetRequest.mockResolvedValueOnce({ data: { message: 'Success' } });
    
    renderComponent();
    const input = screen.getByRole('textbox');
    const submitBtn = screen.getByRole('button', { name: /Reset Password/i });

    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(submitBtn);

   
    expect(screen.getByText(/Sending.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(passwordResetRequest).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockNavigate).toHaveBeenCalledWith('/reset-password', { 
        state: { email: 'user@example.com' } 
      });
    });
  });

  test('handles API error correctly', async () => {
   
    const errorMessage = "User with this email does not exist.";
    passwordResetRequest.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    });

    renderComponent();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'wrong@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
     
      expect(input).toHaveAttribute('placeholder', errorMessage);
      expect(input).toHaveClass('border-red-500');
    });
  });

  test('navigates back to sign in when button is clicked', () => {
    renderComponent();
    const signInBtn = screen.getByRole('button', { name: /Sign in/i });
    
    fireEvent.click(signInBtn);
    
 
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });
});