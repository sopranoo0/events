import { FastifyPluginAsync } from "fastify";
import { AppDataSource } from "../../db/data-source";
import { Event as EvetnEntity } from '../../db/entities/event.entity'
import { EventParticipant } from "../../db/entities/event-participant.entity";
import { createEventSchema, updateEventSchema } from "./events.schemas";

type EventParams = { id: string }

export const eventsRoutes: FastifyPluginAsync = async (app) => {
    const eventRepository = AppDataSource.getRepository(EvetnEntity);
    const participantsRepository = AppDataSource.getRepository(EventParticipant)

    app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
        const parsedBody = createEventSchema.safeParse(request.body);

        if (!parsedBody.success) {
            return reply.code(400).send({
                message: 'Validation Error',
                errors: parsedBody.error.issues.map(issue => ({
                    path: issue.path.join("."),
                    message: issue.message
                }))
            })
        }

        const {
            title,
            description,
            capacity,
            address,
            startsAt,
        } = parsedBody.data


        const event = eventRepository.create({
            title,
            description,
            capacity,
            address,
            startsAt,
            ownerId: request.user.sub
        })

        const savedEvenet = await eventRepository.save(event);

        return reply.code(201).send(savedEvenet)
    })

    app.get('/', { preHandler: [app.authenticate] }, async () => {   // Найти все события
        return eventRepository.find({
            order: { startsAt: 'ASC' }
        })
    })

    app.get<{ Params: EventParams }>('/:id',   // Найти событие по id
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const event = await eventRepository.findOne({
                where: { id: request.params.id }
            })

            if (!event) {
                return reply.code(404).send({ message: 'Событие не найдо' })
            }

            return reply.send(event)
        })

    app.patch<{ Params: EventParams }>(  // Отредактировать событие по id
        '/:id', 
        { preHandler: [app.authenticate]}, 
        async (request, reply) => {
            const event = await eventRepository.findOne({ 
                where: { id: request.params.id}
            })

            if (!event) {
                return reply.code(404).send({ message: 'Событие не найдо' })
            }

            if (event.ownerId !== request.user.sub) {
                return reply.code(403).send({
                    message: 'Только владелец может редактировать'
                })
            }

            const parsedBody = updateEventSchema.safeParse(request.body);

            if(!parsedBody.success) {
                return reply.code(400).send({
                    message: 'Validation error',
                    errors: parsedBody.error.issues.map(issue => ({
                        path: issue.path.join("."),
                        message: issue.message
                    }))
                })
            }

            const { 
                title,
                description,
                capacity,
                address,
                startsAt,
            } = parsedBody.data

            if (title !== undefined) {
                event.title = title
            }

            if (description !== undefined) {
                event.description = description
            }

            if (capacity !== undefined) {
                event.capacity = capacity
            }

            if (address !== undefined) {
                event.address = address
            }

            if (startsAt !== undefined) {
                event.startsAt = startsAt
            }

            const updatedEvent = await eventRepository.save(event);

            return reply.send(updatedEvent)
    })

    app.delete<{ Params: EventParams }>(   // Удалить событие по id
        '/:id',
        { preHandler: [app.authenticate] }, async (request, reply) => {
            const event = await eventRepository.findOne({ where: { id: request.params.id } });

            if (!event) {
                return reply.code(404).send({ message: 'Событие не найдено' })
            }

            if (event.ownerId !== request.user.sub) {
                return reply.code(403).send({
                    message: 'Только владелец может удалить свое событие'
                })
            }

            await eventRepository.delete({ id: event.id })
            return reply.code(204).send()
        })

    app.post<{ Params: EventParams }>(   // Присоединиться к событию по id
        '/:id/join',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const event = await eventRepository.findOne({ where: { id: request.params.id } });

            if (!event) {
                return reply.code(404).send({ message: 'Событие не найдо' })
            }


            if (event.ownerId === request.user.sub) {
                return reply.code(400).send({
                    message: 'Нельзя присоединиться к своему событию'
                })
            }

            const existingParticipation = await participantsRepository.findOne({
                where: { eventId: event.id, userId: request.user.sub }
            })

            if (existingParticipation) {
                return reply.code(409).send({
                    message: 'Вы уже присоединились к событию'
                })
            }

            const participationCount = await participantsRepository.count({
                where: { eventId: event.id }
            })

            if (participationCount >= event.capacity) {
                return reply.code(409).send({
                    message: 'Свободных мест нету'
                })
            }

            const participation = participantsRepository.create({
                eventId: event.id,
                userId: request.user.sub
            })

            const savedParicipation = await participantsRepository.save(participation)

            return reply.code(201).send({
                message: "Вы присоединились к событию",
                participation: savedParicipation
            })
        }
    )

    app.delete<{ Params: EventParams }>(    // Выйти из события по id
        '/:id/join',
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            const event = await eventRepository.findOne({ where: { id: request.params.id } });

            if (!event) {
                return reply.code(404).send({ message: 'Событие не найдо' })
            }

            const existingParticipation = await participantsRepository.findOne({
                where: { eventId: event.id, userId: request.user.sub }
            })

            if (!existingParticipation) {
                return reply.code(409).send({
                    message: 'Вы не присоединялись к событию'
                })
            }

            await participantsRepository.delete({
                id: existingParticipation.id,
            })

            return reply.code(204).send()
        }
    )
}