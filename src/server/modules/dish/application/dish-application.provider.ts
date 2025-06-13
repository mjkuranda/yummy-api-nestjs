import { Provider } from '@nestjs/common';
import {
    AddDishCommentUseCase,
    AddDishProposalsUseCase,
    AddDishRatingUseCase,
    ConfirmDishCreationUseCase,
    ConfirmDishDeletionUseCase,
    ConfirmDishEditionUseCase,
    CreateDishUseCase,
    DeleteDishUseCase,
    EditDishUseCase,
    GetDishCommentsUseCase,
    GetDishDetailsUseCase,
    GetDishProposalsUseCase,
    GetDishRatingUseCase,
    GetDishesUseCase,
    GetDishesWithSoftAddedUseCase,
    GetDishesWithSoftDeletedUseCase,
    GetDishesWithSoftEditedUseCase
} from './use-cases';

export const dishApplicationProviders: Provider[] = [
    AddDishCommentUseCase,
    AddDishProposalsUseCase,
    AddDishRatingUseCase,
    ConfirmDishCreationUseCase,
    ConfirmDishDeletionUseCase,
    ConfirmDishEditionUseCase,
    CreateDishUseCase,
    DeleteDishUseCase,
    EditDishUseCase,
    GetDishCommentsUseCase,
    GetDishDetailsUseCase,
    GetDishProposalsUseCase,
    GetDishRatingUseCase,
    GetDishesUseCase,
    GetDishesWithSoftAddedUseCase,
    GetDishesWithSoftDeletedUseCase,
    GetDishesWithSoftEditedUseCase
];