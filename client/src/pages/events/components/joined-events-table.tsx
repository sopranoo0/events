import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import { formatStartsAt } from "@/lib/utils"
import type { JoinedEventItem } from "@/shared/api/types"
import { Link } from "react-router-dom"

type Props = {
    rows: JoinedEventItem[]
}

export function JoinedEventsTable({ rows }: Props) {
    const sorted = rows
        .slice()
        .sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt))

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Начало события</TableHead>
                    <TableHead>Присоединился</TableHead>
                    <TableHead>Адрес</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    sorted.map(row => (
                        <TableRow key={row.event.id}>
                            <TableCell className="max-w-[12rem] font-medium">
                                <Link
                                    className="hover:text-primary"
                                    to={`/events/${row.event.id}`}
                                >
                                    {row.event.title}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                { formatStartsAt(row.event.startsAt)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                { formatStartsAt(row.joinedAt) }
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                { row.event.address }
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}