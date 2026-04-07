import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServiceManagement from '../pages/ServiceManagement';

//  Mock the API module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn(),
    post: vi.fn(),
  },
  getServices:        vi.fn(),
  deleteListing:      vi.fn(),
  uploadListingImage: vi.fn(),
}));

// Mock heavy child components 
vi.mock('../components/VendorSidebar', () => ({
  default: () => <div data-testid="vendor-sidebar">Sidebar</div>,
}));

vi.mock('../components/adminDashboard/Navbar4', () => ({
  default: ({ onMenuClick }) => (
    <div data-testid="navbar">
      <button onClick={onMenuClick}>Menu</button>
    </div>
  ),
}));

vi.mock('../components/Vendormanagement/ServiceForm', () => ({
  default: ({ onClose }) => (
    <div data-testid="service-form">
      <button onClick={() => onClose(true)}>Save Form</button>
      <button onClick={() => onClose(false)}>Cancel Form</button>
    </div>
  ),
}));

//  Import AFTER vi.mock calls 
import { getServices, deleteListing } from '../services/api';

// Render helper
const renderPage = () =>
  render(
    <MemoryRouter>
      <ServiceManagement />
    </MemoryRouter>
  );

// Shared mock data
const mockServices = [
  {
    id: 1,
    title: 'Business Coaching',
    business_category: 'professional',
    price: '150000',
    price_unit: 'session',
    status: 'published',
    availability: 'available',
    description: 'Executive coaching service',
    images: [],
    detail: {},
  },
  {
    id: 2,
    title: 'Airport Transfer',
    business_category: 'transport',
    price: '80000',
    price_unit: 'trip',
    status: 'draft',
    availability: 'available',
    description: 'Reliable airport pickup',
    images: [],
    detail: {},
  },
  {
    id: 3,
    title: 'Deluxe Hotel Room',
    business_category: 'hotels',
    price: '200000',
    price_unit: 'night',
    status: 'archived',
    availability: 'limited',
    description: 'Comfortable hotel stay',
    images: [],
    detail: {},
  },
  // Tailoring service (professional category, sub-category tailoring) 
  {
    id: 4,
    title: 'Custom Wedding Dress',
    business_category: 'professional',
    price: '500000',
    price_unit: 'project',
    status: 'published',
    availability: 'by_request',
    description: 'Handmade wedding gowns',
    images: [],
    detail: {
      sub_category: 'tailoring',
      fabric_material: 'Silk blend',
      duration: '14 days',
      delivery_mode: 'in-person',
    },
  },
  // Airline service 
  {
    id: 5,
    title: 'Kampala to Nairobi Flight',
    business_category: 'airlines',
    price: '350000',
    price_unit: 'seat',
    status: 'published',
    availability: 'available',
    description: 'Daily scheduled flights',
    images: [],
    detail: {
      service_type: 'scheduled',
      flight_number: 'EK-101',
      origin: 'Entebbe (EBB)',
      destination: 'Nairobi (NBO)',
      flight_duration: '1h 30min',
      iata_code: 'EK',
    },
  },
];


describe('ServiceManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServices.mockResolvedValue([]);
  });

  // 1. Rendering
  describe('Rendering', () => {
    test('renders page title and Add New Service button', async () => {
      renderPage();
      expect(await screen.findByText('Service Management')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add New Service/i })).toBeInTheDocument();
    });

    test('renders sidebar and navbar', async () => {
      renderPage();
      expect(await screen.findByTestId('vendor-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    test('shows loading skeletons while API call is in-flight', () => {
      // Never resolves → component stays in loading state
      getServices.mockImplementation(() => new Promise(() => {}));
      renderPage();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('renders stat cards section', async () => {
      renderPage();
      await screen.findByText('Service Management');
      expect(screen.getByText('Total Services')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Archived')).toBeInTheDocument();
    });
  });

  // 2. Empty state
  describe('Empty state', () => {
    test('shows empty state message when no services returned', async () => {
      renderPage();
      expect(await screen.findByText('No Services Found')).toBeInTheDocument();
    });

    test('empty state contains Add New Service call-to-action', async () => {
      renderPage();
      await screen.findByText('No Services Found');
      // The hint text inside the empty state box
      expect(screen.getByText(/Click "Add New Service"/i)).toBeInTheDocument();
    });
  });

  // 3. Services list
  describe('Services list', () => {
    beforeEach(() => {
      getServices.mockResolvedValue(mockServices);
    });

    test('renders all service titles after loading', async () => {
      renderPage();
      expect(await screen.findByText('Business Coaching')).toBeInTheDocument();
      expect(screen.getByText('Airport Transfer')).toBeInTheDocument();
      expect(screen.getByText('Deluxe Hotel Room')).toBeInTheDocument();
      expect(screen.getByText('Custom Wedding Dress')).toBeInTheDocument();
      expect(screen.getByText('Kampala to Nairobi Flight')).toBeInTheDocument();
    });

    test('Total Services stat card reflects correct count', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      const label = screen.getByText('Total Services');
      const card  = label.closest('.space-y-2');
      expect(card.querySelector('p.text-2xl')).toHaveTextContent('5');
    });

    test('Published stat card reflects correct count', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      const label = screen.getByText('Published');
      const card  = label.closest('.space-y-2');
      // published services: Business Coaching, Custom Wedding Dress, Kampala Flight = 3
      expect(card.querySelector('p.text-2xl')).toHaveTextContent('3');
    });

    test('Draft stat card reflects correct count', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      const label = screen.getByText('Draft');
      const card  = label.closest('.space-y-2');
      // draft services: Airport Transfer = 1
      expect(card.querySelector('p.text-2xl')).toHaveTextContent('1');
    });

    test('Archived stat card reflects correct count', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      const label = screen.getByText('Archived');
      const card  = label.closest('.space-y-2');
      // archived services: Deluxe Hotel Room = 1
      expect(card.querySelector('p.text-2xl')).toHaveTextContent('1');
    });

    test('shows service count summary at the bottom', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  //  4. Tailoring service 
  describe('Tailoring service', () => {
    beforeEach(() => {
      getServices.mockResolvedValue(mockServices);
    });

    test('tailoring service title is visible in the list', async () => {
      renderPage();
      expect(await screen.findByText('Custom Wedding Dress')).toBeInTheDocument();
    });

    test('search finds the tailoring service by title', async () => {
      renderPage();
      await screen.findByText('Custom Wedding Dress');

      fireEvent.change(
        screen.getByPlaceholderText(/Filter by title or category/i),
        { target: { value: 'Wedding' } }
      );

      expect(screen.getByText('Custom Wedding Dress')).toBeInTheDocument();
      // All other services should be filtered out
      expect(screen.queryByText('Business Coaching')).not.toBeInTheDocument();
      expect(screen.queryByText('Airport Transfer')).not.toBeInTheDocument();
    });

    test('tailoring service has published status in mock data', () => {
      const tailoring = mockServices.find(s => s.id === 4);
      expect(tailoring.status).toBe('published');
      expect(tailoring.detail.sub_category).toBe('tailoring');
      expect(tailoring.detail.fabric_material).toBe('Silk blend');
    });
  });

  //5. Airline service
  describe('Airline service', () => {
    beforeEach(() => {
      getServices.mockResolvedValue(mockServices);
    });

    test('airline service title is visible in the list', async () => {
      renderPage();
      expect(await screen.findByText('Kampala to Nairobi Flight')).toBeInTheDocument();
    });

    test('search finds the airline service by title', async () => {
      renderPage();
      await screen.findByText('Kampala to Nairobi Flight');

      fireEvent.change(
        screen.getByPlaceholderText(/Filter by title or category/i),
        { target: { value: 'Nairobi' } }
      );

      expect(screen.getByText('Kampala to Nairobi Flight')).toBeInTheDocument();
      expect(screen.queryByText('Business Coaching')).not.toBeInTheDocument();
      expect(screen.queryByText('Custom Wedding Dress')).not.toBeInTheDocument();
    });

    test('airline service data has correct structure', () => {
      const airline = mockServices.find(s => s.id === 5);
      expect(airline.business_category).toBe('airlines');
      expect(airline.detail.flight_number).toBe('EK-101');
      expect(airline.detail.origin).toBe('Entebbe (EBB)');
      expect(airline.detail.destination).toBe('Nairobi (NBO)');
    });
  });

  // 6. Search
  describe('Search', () => {
    beforeEach(() => {
      getServices.mockResolvedValue(mockServices);
    });

    test('filters services by partial title match', async () => {
      renderPage();
      await screen.findByText('Business Coaching');

      fireEvent.change(
        screen.getByPlaceholderText(/Filter by title or category/i),
        { target: { value: 'Airport' } }
      );

      expect(screen.getByText('Airport Transfer')).toBeInTheDocument();
      expect(screen.queryByText('Business Coaching')).not.toBeInTheDocument();
    });

    test('shows No Services Found for unmatched search', async () => {
      renderPage();
      await screen.findByText('Business Coaching');

      fireEvent.change(
        screen.getByPlaceholderText(/Filter by title or category/i),
        { target: { value: 'xyznonexistent999' } }
      );

      expect(screen.getByText('No Services Found')).toBeInTheDocument();
    });

    test('search is case-insensitive', async () => {
      renderPage();
      await screen.findByText('Business Coaching');

      fireEvent.change(
        screen.getByPlaceholderText(/Filter by title or category/i),
        { target: { value: 'BUSINESS COACHING' } }
      );

      expect(screen.getByText('Business Coaching')).toBeInTheDocument();
    });

    test('clearing search restores full list', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      const input = screen.getByPlaceholderText(/Filter by title or category/i);

      fireEvent.change(input, { target: { value: 'Airport' } });
      expect(screen.queryByText('Business Coaching')).not.toBeInTheDocument();

      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getByText('Business Coaching')).toBeInTheDocument();
      expect(screen.getByText('Airport Transfer')).toBeInTheDocument();
    });
  });

  // 7. View mode toggle 
  describe('View mode toggle', () => {
    beforeEach(() => {
      getServices.mockResolvedValue(mockServices);
    });

    test('service grid uses grid layout by default', async () => {
      renderPage();
      await screen.findByText('Business Coaching');
      // The grid container has grid-cols classes when in grid mode
      const gridContainer = document.querySelector('.grid.grid-cols-1');
      expect(gridContainer).toBeInTheDocument();
    });

    test('switching to list view changes the layout', async () => {
      renderPage();
      await screen.findByText('Business Coaching');

      // Find all buttons and click the list-mode button (second in the toggle pair)
      const allButtons = screen.getAllByRole('button');
      // The list view button is identifiable by its parent container structure
      // It's inside the flex container with the grid/list toggle pair
      const viewToggleButtons = allButtons.filter(btn =>
        btn.className.includes('w-10') && btn.className.includes('h-10')
      );
      expect(viewToggleButtons.length).toBe(2); // grid + list buttons
      fireEvent.click(viewToggleButtons[1]); // click list button

      // After clicking list, grid-cols-3 should be gone
      await waitFor(() => {
        expect(document.querySelector('.xl\\:grid-cols-3')).not.toBeInTheDocument();
      });
    });
  });

  // 8. Add New Service modal 
  describe('Add New Service modal', () => {
    test('opens ServiceForm modal when button is clicked', async () => {
      renderPage();
      await screen.findByText('No Services Found');

      fireEvent.click(screen.getByRole('button', { name: /Add New Service/i }));
      expect(await screen.findByTestId('service-form')).toBeInTheDocument();
    });

    test('closes modal when form cancel is triggered', async () => {
      renderPage();
      await screen.findByText('No Services Found');

      fireEvent.click(screen.getByRole('button', { name: /Add New Service/i }));
      await screen.findByTestId('service-form');

      fireEvent.click(screen.getByRole('button', { name: /Cancel Form/i }));
      expect(screen.queryByTestId('service-form')).not.toBeInTheDocument();
    });

    test('closes modal and re-fetches services after successful save', async () => {
      renderPage();
      await screen.findByText('No Services Found');

      fireEvent.click(screen.getByRole('button', { name: /Add New Service/i }));
      await screen.findByTestId('service-form');

      fireEvent.click(screen.getByRole('button', { name: /Save Form/i }));

      await waitFor(() => {
        expect(screen.queryByTestId('service-form')).not.toBeInTheDocument();
      });
      // Called once on mount, once after save
      expect(getServices).toHaveBeenCalledTimes(2);
    });
  });

  //  9. Delete modal
  describe('Delete modal', () => {
    test('delete modal is not visible on initial render', async () => {
      getServices.mockResolvedValue(mockServices);
      renderPage();
      await screen.findByText('Business Coaching');
      expect(screen.queryByText('Delete Service?')).not.toBeInTheDocument();
    });
  });
});