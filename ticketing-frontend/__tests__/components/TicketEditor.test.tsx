import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketEditor } from '@/components/TicketEditor'
import { Priority } from '@/lib/types'

const mockOnSave = jest.fn()
const mockOnClose = jest.fn()

describe('TicketEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders ticket creation form', () => {
    render(<TicketEditor onSave={mockOnSave} onClose={mockOnClose} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
  })

  it('allows user to fill in ticket details', async () => {
    const user = userEvent.setup()
    render(<TicketEditor onSave={mockOnSave} onClose={mockOnClose} />)

    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await user.type(titleInput, 'Test Ticket')
    await user.type(descriptionInput, 'Test Description')

    expect(titleInput).toHaveValue('Test Ticket')
    expect(descriptionInput).toHaveValue('Test Description')
  })

  it('calls onSave with form data when submitted', async () => {
    const user = userEvent.setup()
    render(<TicketEditor onSave={mockOnSave} onClose={mockOnClose} />)

    await user.type(screen.getByLabelText(/title/i), 'Test Ticket')
    await user.type(screen.getByLabelText(/description/i), 'Test Description')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: Priority.MEDIUM,
      })
    })
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TicketEditor onSave={mockOnSave} onClose={mockOnClose} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    render(<TicketEditor onSave={mockOnSave} onClose={mockOnClose} />)

    await user.keyboard('{Escape}')

    expect(mockOnClose).toHaveBeenCalled()
  })
})

