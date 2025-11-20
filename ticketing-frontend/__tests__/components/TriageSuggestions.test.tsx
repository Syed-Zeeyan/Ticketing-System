import { render, screen, waitFor } from '@testing-library/react'
import { TriageSuggestions } from '@/components/TriageSuggestions'
import { Priority, TriagePrediction } from '@/lib/types'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api')

const mockOnApply = jest.fn()
const mockOnDismiss = jest.fn()

describe('TriageSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    render(
      <TriageSuggestions
        title="Test"
        description="Test description"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    )

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument()
  })

  it('displays triage prediction when available', async () => {
    const mockPrediction: TriagePrediction = {
      category: 'Authentication',
      suggestedPriority: Priority.HIGH,
      urgencyScore: 0.8,
      suggestedAssigneeId: 1,
      confidence: 0.85,
      keywords: ['login', 'password', 'access'],
      predictedSlaBreachProbability: 0.6,
    }

    ;(apiClient.post as jest.Mock).mockResolvedValue({ data: mockPrediction })

    render(
      <TriageSuggestions
        title="Cannot login"
        description="I cannot login to the system"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/smart suggestions/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/high/i)).toBeInTheDocument()
    })
  })

  it('calls onApply when apply button is clicked', async () => {
    const mockPrediction: TriagePrediction = {
      category: 'Network',
      suggestedPriority: Priority.MEDIUM,
      urgencyScore: 0.5,
      confidence: 0.7,
      keywords: ['network', 'connection'],
      predictedSlaBreachProbability: 0.3,
    }

    ;(apiClient.post as jest.Mock).mockResolvedValue({ data: mockPrediction })

    render(
      <TriageSuggestions
        title="Network issue"
        description="Network connection problem"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/apply suggestion/i)).toBeInTheDocument()
    })

    const applyButton = screen.getByRole('button', { name: /apply suggestion/i })
    applyButton.click()

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalled()
    })
  })

  it('displays keywords when available', async () => {
    const mockPrediction: TriagePrediction = {
      category: 'Infrastructure',
      suggestedPriority: Priority.CRITICAL,
      urgencyScore: 0.9,
      confidence: 0.9,
      keywords: ['server', 'down', 'critical'],
      predictedSlaBreachProbability: 0.8,
    }

    ;(apiClient.post as jest.Mock).mockResolvedValue({ data: mockPrediction })

    render(
      <TriageSuggestions
        title="Server down"
        description="Critical server is down"
        onApply={mockOnApply}
        onDismiss={mockOnDismiss}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/server/i)).toBeInTheDocument()
    })
  })
})

