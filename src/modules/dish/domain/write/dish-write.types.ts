import { DishRatingDocument } from '../../../../mongodb/documents/dish-rating.document';

// TODO: Deprecated

export interface AddDishRatingResult {
    dishRating: DishRatingDocument;
    isNew: boolean;
}

export interface ConfirmDeletingResult {
    wasDeleted: boolean;
    dishTitle: string;
}