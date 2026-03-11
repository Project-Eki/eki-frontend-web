import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../pages/SignIn';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <SignIn />
    </BrowserRouter>
  );

  test('renders all form elements correctly with updated text', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
  });

  test('shows error messages when fields are empty and form is submitted', async () => {
    renderComponent();
    
    const signInButton = screen.getByRole('button', { name: /^Sign In$/i });
    fireEvent.click(signInButton);

    // Wait for the validation logic to show error borders or text
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText(/Email Address/i);
      const passwordInput = screen.getByPlaceholderText(/^Password$/i);
      
      // Checking for the 'border-red-500' class you use in your SignIn logic
      expect(emailInput).toHaveClass('border-red-500');
      expect(passwordInput).toHaveClass('border-red-500');
    });
  });

  test('toggles password visibility when eye icon is clicked', () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText(/^Password$/i);
    
    // Select the toggle button (it's the only other button inside the form)
    // Or use the one with the eye icon
    const toggleButton = screen.getByRole('button', { name: /forgot password/i })
      .parentElement.previousElementSibling.querySelector('button');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});