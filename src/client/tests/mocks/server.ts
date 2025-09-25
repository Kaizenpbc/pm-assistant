import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for client-side testing
export const server = setupServer(...handlers);
