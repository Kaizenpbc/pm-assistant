import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '@pages/ErrorPages';

const withRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('NotFoundPage', () => {
  it('renders 404 and links', () => {
    withRouter(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('href', '/dashboard');
  });
});

describe('ForbiddenPage', () => {
  it('renders 403 and links', () => {
    withRouter(<ForbiddenPage />);
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Home/i })).toBeInTheDocument();
  });
});

describe('ServerErrorPage', () => {
  it('renders 500 and refresh action', () => {
    withRouter(<ServerErrorPage />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh page/i })).toBeInTheDocument();
  });
});
