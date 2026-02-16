import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiAssistant } from './AiAssistant';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from '../services/AiService';

// Mock the AiService
vi.mock('../services/AiService', () => ({
    AiService: {
        chat: vi.fn(),
    },
}));

// Mock Supabase Auth Provider
vi.mock('./auth/SupabaseAuthProvider', () => ({
    useAuth: () => ({
        user: { id: 'test-user' },
    }),
}));

// Mock ScrollArea since it uses ResizeObserver which might not be available in jsdom
vi.mock('./ui/scroll-area', () => ({
    ScrollArea: ({ children, className }: { children: React.ReactNode; className: string }) => (
        <div className={className} data-testid="scroll-area">
            {children}
        </div>
    ),
}));

describe('AiAssistant Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the AI Assistant button', () => {
        render(<AiAssistant />);
        const button = screen.getByRole('button', { name: 'Open AI Assistant' });
        expect(button).toBeInTheDocument();
    });

    it('opens the chat sheet when clicked', () => {
        render(<AiAssistant />);
        const button = screen.getByRole('button', { name: 'Open AI Assistant' });
        fireEvent.click(button);

        expect(screen.getByText('Chennai AI Assistant')).toBeInTheDocument();
        expect(screen.getByText(/Vanakkam! I am Chennai AI/i)).toBeInTheDocument();
    });

    it('allows user to type and send a message', async () => {
        // Mock successful response
        (AiService.chat as any).mockResolvedValue({ content: 'Here is a list of temples.' });

        render(<AiAssistant />);

        // Open chat
        const triggerButton = screen.getByRole('button', { name: 'Open AI Assistant' });
        fireEvent.click(triggerButton);

        // Find input and type
        const input = screen.getByPlaceholderText('Ask about Chennai...');
        fireEvent.change(input, { target: { value: 'Show me temples' } });

        // Click send
        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        // Check if user message appears
        expect(screen.getByText('Show me temples')).toBeInTheDocument();

        // Verify service call
        expect(AiService.chat).toHaveBeenCalledWith('Show me temples');

        // Verify response
        await waitFor(() => {
            expect(screen.getByText('Here is a list of temples.')).toBeInTheDocument();
        });
    });

    it('displays error message on service failure', async () => {
        // Mock error response
        (AiService.chat as any).mockRejectedValue(new Error('Network error'));

        render(<AiAssistant />);

        // Open chat
        fireEvent.click(screen.getByRole('button', { name: 'Open AI Assistant' }));

        // Send message
        const input = screen.getByPlaceholderText('Ask about Chennai...');
        fireEvent.change(input, { target: { value: 'Hello' } });

        const sendButton = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(sendButton);

        // Verify error message
        await waitFor(() => {
            expect(screen.getByText(/trouble connecting/i)).toBeInTheDocument();
        });
    });
});
