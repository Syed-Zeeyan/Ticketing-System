export enum Role {
  USER = 'USER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Status {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: number
  title: string
  description: string
  priority: Priority
  status: Status
  ownerId: number
  ownerName: string
  assigneeId?: number
  assigneeName?: string
  createdAt: string
  updatedAt: string
  slaDueAt?: string
  urgencyScore?: number
  rating?: number
}

export interface Comment {
  id: number
  ticketId: number
  userId: number
  userName: string
  content: string
  createdAt: string
}

export interface Attachment {
  id: number
  ticketId: number
  filename: string
  url: string
  uploadedById: number
  uploadedByName: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface TriagePrediction {
  category: string
  suggestedPriority: Priority
  urgencyScore: number
  suggestedAssigneeId?: number
  confidence: number
  keywords: string[]
  predictedSlaBreachProbability: number
}

export interface TicketSearchResponse {
  content: Ticket[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdminStats {
  openCount: number
  avgResolutionTime: number
  slaBreaches: number
  avgRating: number
}

