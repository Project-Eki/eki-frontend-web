import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordPage from '../pages/ResetPassword'; // <-- CHECK THIS FILENAME
import { passwordResetConfirm } from '../services/api';

const mockNavigate = vi.fn();


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


vi.mock('../services/api', () => ({
  passwordResetConfirm: vi.fn(),
}));

describe('ResetPasswordPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

 
  const renderWithEmail = (email = 'test@vendor.com') => {
    return render(
      <MemoryRouter initialEntries={[{ pathname: '/reset', state: { email } }]}>
        <Routes>
          <Route path="/reset" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders email from state and input fields', () => {
    renderWithEmail('user@example.com');
    expect(screen.getByText(/for user@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/OTP Code/i)).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderWithEmail();
    
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'WrongMatch123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /^Reset Password$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords must match/i)).toBeInTheDocument();
    });
  });

  test('successful API call navigates to signin', async () => {
    passwordResetConfirm.mockResolvedValueOnce({ data: { detail: 'Success' } });
    renderWithEmail();

    fireEvent.change(screen.getByLabelText(/OTP Code/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'NewPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /^Reset Password$/i }));

    await waitFor(() => {
      expect(passwordResetConfirm).toHaveBeenCalledWith(expect.objectContaining({
        otp_code: '123456',
        new_password: 'NewPass123!'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });
});