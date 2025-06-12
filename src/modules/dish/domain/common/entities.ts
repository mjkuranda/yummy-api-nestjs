import { DishEntityProps } from './types';
import { DishId } from '../../dish.types';

export class DishEntity {

    constructor(private readonly props: DishEntityProps) {}

    getTitle(): string {
        return this.props.title;
    }

    getAuthor(): string {
        return this.props.author;
    }

    isSoftDeleted(): boolean {
        return this.props.softDeleted === true;
    }

}

export class DishCommentEntity {

    constructor(
        private readonly dishId: DishId,
        private readonly user: string,
        private readonly text: string,
        private readonly posted: number
    ) {}

}

export class DishRatingEntity {

    constructor(
        private readonly dishId: DishId,
        private readonly rating: number,
        private readonly count: number,
    ) {}

    getAverageRating(): number {
        return this.rating;
    }

    getRatingCount(): number {
        return this.count;
    }

}