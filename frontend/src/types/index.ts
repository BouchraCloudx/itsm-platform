export type Role = 'USER' | 'TECHNICIAN' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdBy: string;
  assignedTo: string | null;
  resolutionTimeMinutes: number | null;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  relatedTicketId: string | null;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  profiles?: Profile[];
}

export interface Profile {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  teamId: string | null;
  team?: Team;
}
