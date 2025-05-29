import { Provider } from '@nestjs/common';
import { AddDishCommentUseCase } from './use-cases/add-dish-comment.use-case';
import { AddDishProposalsUseCase } from './use-cases/add-dish-proposals.use-case';
import { AddDishRatingUseCase } from './use-cases/add-dish-rating.use-case';
import { ConfirmDishCreationUseCase } from './use-cases/confirm-dish-creation.use-case';
import { ConfirmDishDeletionUseCase } from './use-cases/confirm-dish-deletion.use-case';
import { ConfirmDishEditionUseCase } from './use-cases/confirm-dish-edition.use-case';
import { CreateDishUseCase } from './use-cases/create-dish.use-case';
import { DeleteDishUseCase } from './use-cases/delete-dish.use-case';
import { EditDishUseCase } from './use-cases/edit-dish.use-case';
import { GetDishCommentsUseCase } from './use-cases/get-dish-comments.use-case';
import { GetDishDetailsUseCase } from './use-cases/get-dish-details.use-case';
import { GetDishProposalsUseCase } from './use-cases/get-dish-proposals.use-case';
import { GetDishRatingUseCase } from './use-cases/get-dish-rating.use-case';
import { GetDishesUseCase } from './use-cases/get-dishes.use-case';
import { GetDishesWithSoftAddedUseCase } from './use-cases/get-dishes-with-soft-added.use-case';
import { GetDishesWithSoftDeletedUseCase } from './use-cases/get-dishes-with-soft-deleted.use-case';
import { GetDishesWithSoftEditedUseCase } from './use-cases/get-dishes-with-soft-edited.use-case';

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