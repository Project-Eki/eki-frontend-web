import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  test('renders with logo', () => {
    render(<Navbar />);
    const logo = screen.getByAltText('Eki Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src'); // Check if src attribute exists
  });

  test('language dropdown opens on click', () => {
    render(<Navbar />);

    // Find and click the language button
    const languageButton = screen.getByRole('button', { name: /EN/i });
    fireEvent.click(languageButton);

    // Check if dropdown options appear
    expect(screen.getByText('Kiswahili')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument(); 
  });

  
  test('navigation links are present', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });
});