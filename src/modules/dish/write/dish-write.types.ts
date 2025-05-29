import { DishRatingDocument } from '../../../mongodb/documents/dish-rating.document';

export interface AddDishRatingResult {
    dishRating: DishRatingDocument;
    isNew: boolean;
}

export interface EditDishResult {
    dishTitle: string;
}

export interface DeleteDishResult {
    dishTitle: string;
    isSoftDeleted: boolean;
}

export interface ConfirmDeletingResult {
    wasDeleted: boolean;
    dishTitle: string;
}