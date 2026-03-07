import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest'; 
import SignIn from '../pages/SignIn';

describe('SignIn Component', () => {
 
  const mockOnSignIn = vi.fn();
  const mockOnGoogleSignIn = vi.fn();
  const mockOnSignUpClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <SignIn
        onSignIn={mockOnSignIn}
        onGoogleSignIn={mockOnGoogleSignIn}
        onSignUpClick={mockOnSignUpClick}
        {...props}
      />
    );
  };

  test('renders all form elements correctly', () => {
    renderComponent();
    
    expect(screen.getByText(/Welcome back! ready to sell?/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  
});