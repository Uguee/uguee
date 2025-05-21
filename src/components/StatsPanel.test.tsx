
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsPanel from './StatsPanel';
import { useStats } from '../hooks/useStats';

// Mock the useStats hook
jest.mock('../hooks/useStats', () => ({
  useStats: jest.fn()
}));

describe('StatsPanel Component', () => {
  test('renders university name and campus', () => {
    // Mock the return value of useStats
    (useStats as jest.Mock).mockReturnValue({
      stats: {
        availableVehicles: 10,
        activeRoutes: 5,
        connectedTravelers: 20
      },
      isLoading: false
    });

    render(<StatsPanel universityName="Test University" campus="Main Campus" />);
    
    // Check if university name and campus are rendered
    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('Main Campus')).toBeInTheDocument();
    
    // Check if stats are rendered
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('shows loading state when data is loading', () => {
    // Mock loading state
    (useStats as jest.Mock).mockReturnValue({
      stats: {
        availableVehicles: 0,
        activeRoutes: 0,
        connectedTravelers: 0
      },
      isLoading: true
    });

    render(<StatsPanel />);
    
    // Check if loading indicators are shown
    const loadingElements = screen.getAllByRole('status');
    expect(loadingElements.length).toBeGreaterThan(0);
  });
});
