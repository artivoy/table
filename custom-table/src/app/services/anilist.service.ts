import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';
import { EpisodesGQL, EpisodesQueryVariables, Media } from 'src/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class AnilistService {

    constructor(private episodes: EpisodesGQL) { }

    getEpisodes(filter: EpisodesQueryVariables) {
        return this.episodes.fetch(filter).pipe(
            shareReplay(1)
        )
    }
}
