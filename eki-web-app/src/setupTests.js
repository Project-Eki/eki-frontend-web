// It allows you to write expect(button).toBeInTheDocument(). Without it, Vitest will say "toBeInTheDocument is not a function."
// src/setupTests.js
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically unmount React trees after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});

// Mocking 'window.scrollTo' (Commonly used in Onboarding forms but missing in JSDOM)
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });

