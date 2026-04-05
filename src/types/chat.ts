export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'sent' | 'error';
}

export interface Intent {
  type: 'navigate' | 'query_status' | 'search' | 'help' | 'general';
  app?: string;
  query?: string;
}
