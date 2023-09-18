import { Media, MediaSort } from "src/graphql/generated";

export interface TableColumn {
    column: string,
    name: string,
    cell: (cell: Media) => string,
    sort: {
        desc: MediaSort,
        asc: MediaSort
    },
    hide: boolean
}

export const TableTemplate: TableColumn[] = [
    {
        "column": "english",
        "name": "Title",
        "cell": (cell: Media) => `${cell.title?.english}`,
        "sort": {
            "desc": MediaSort.TitleEnglishDesc,
            "asc": MediaSort.TitleEnglish
        },
        "hide": false
    },
    {
        "column": "status",
        "name": "Status",
        "cell": (cell: Media) => `${cell.status}`,
        "sort": {
            "desc": MediaSort.StatusDesc,
            "asc": MediaSort.Status
        },
        "hide": false
    },
    {
        "column": "type",
        "name": "Type",
        "cell": (cell: Media) => `${cell.type}`,
        "sort": {
            "desc": MediaSort.TypeDesc,
            "asc": MediaSort.Type
        },
        "hide": false
    },
    {
        "column": "popularity",
        "name": "Popularity",
        "cell": (cell: Media) => `${cell.popularity}`,
        "sort": {
            "desc": MediaSort.PopularityDesc,
            "asc": MediaSort.Popularity
        },
        "hide": false
    },
    {
        "column": "averageScore",
        "name": "Score",
        "cell": (cell: Media) => `${cell.averageScore}`,
        "sort": {
            "desc": MediaSort.ScoreDesc,
            "asc": MediaSort.Score
        },
        "hide": false
    }
]
