import { DishEntityProps } from './types';
import { DishId } from '../../../../common/types';
import { DishIngredient } from '../../../ingredient/ingredient.types';
import { Language } from '../../../../common/types';
import { DishType, MealType, Provider } from '../../../../common/enums';
import { EncodedDishIdVo } from './vos';
import {
    UserSearchQueryDocument
} from '../../../../../infrastructure/databases/mongodb/documents';

export class DishEntity {

    constructor(private readonly props: DishEntityProps) {}

    getEncodedDishId(): EncodedDishIdVo {
        return EncodedDishIdVo.fromParts(
            this.props.provider,
            this.props.id
        );
    }

    getTitle(): string {
        return this.props.title;
    }

    getDescription(): string {
        return this.props.description;
    }

    getIngredients(): DishIngredient[] {
        return this.props.ingredients;
    }

    getReadyInMinutes(): number {
        return this.props.readyInMinutes;
    }

    getAuthor(): string {
        return this.props.author;
    }

    getLanguage(): Language {
        return this.props.language;
    }

    getProvider(): Provider {
        return this.props.provider;
    }

    getDishType(): DishType {
        return this.props.dishType;
    }

    getMealType(): MealType {
        return this.props.mealType;
    }

    getImageUrl(): string {
        return this.props.imageUrl;
    }

    // TODO: Properties... I mean gluten and so on... TO BE DONE ;)
    getProperties(): unknown {
        return undefined;
    }

    isSoftAdded(): boolean {
        return this.props.softAdded;
    }

    getSoftEdited(): DishEntity {
        return this.props.softEdited;
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

    getDishId(): DishId {
        return this.dishId;
    }

    getUserLogin(): string {
        return this.user;
    }

    getText(): string {
        return this.text;
    }

    getPostedTime(): number {
        return this.posted;
    }

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

export class UserSearchQueryEntity {

    private constructor(
        public readonly ingredients: string[],
        public readonly searchDate: Date,
        public readonly userLogin: string
    ) {}

    static fromDocument(doc: UserSearchQueryDocument): UserSearchQueryEntity {
        return new UserSearchQueryEntity(
            doc.ingredients,
            doc.date,
            doc.login
        );
    }

    static fromDocuments(docs: UserSearchQueryDocument[]): UserSearchQueryEntity[] {
        return docs.map(doc => UserSearchQueryEntity.fromDocument(doc));
    }
}