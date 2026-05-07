export type ApiFieldError = {
    path: string
    message: string
}

export type ApiErrorResponse = {
    message: string
    errors?: ApiFieldError[]
}

export type UserPublic = {
    id: string
    email: string
    name: string
}

export type UserProfile = UserPublic & {
    createdAt: string
    updatedAt: string
}

export type AuthLoginRequest = {
    email: string
    password: string
}

export type AuthResponse = {
    token: string
    user: UserPublic
}

export type AuthRegisterRequest = {
    email: string
    password: string
    name: string
}

export type EventDto = {
    id: string
    title: string
    description: string
    capacity: number
    address: string
    startsAt: string
    ownerId: string
    createdAt: string
    updatedAt: string
}

export type CreateEventRequest = {
    title: string
    description: string
    capacity: number
    address: string
    startsAt: string
}

export type UpdateEventRequest = Partial<CreateEventRequest>

export type JoinEventResponse = {
    message: string
    participation: {
        id: string
        eventId: string
        userId: string
        joinedAt: string
    }
}


export type JoinedEventItem = {
    joinedAt: string
    event: EventDto
}