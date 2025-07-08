import { Inject, Injectable } from '@nestjs/common';
import { DishDataManageable } from '../../../data-manageable.interface';
import { DishRepository } from '../../../../dish/domain/dish.repository';
import {
    DishCommentRepository,
    DishRatingRepository
} from '../../../../dish/domain/common/repositories';
import { REPOSITORIES_TOKEN } from '../../../../../constants/nestjs.contant';
import { RepositoryMap } from '../../../../../common/types';
import { MealType, Repository } from '../../../../../common/enums';
import { DishId } from '../../../../dish/dish.types';
import { DishCommentEntity, DishEntity, DishRatingEntity } from '../../../../dish/domain/common/entities';
import { DishIngredient } from '../../../../ingredient/ingredient.types';
import { DishOverviewVo } from '../../../../user/domain/vos';
import { DishResultVo } from '../../../../dish/domain/read/vos';
import { CreateDishVo, EditDishVo } from '../../../../dish/domain/write/vos';

@Injectable()
export class DishApiService implements DishDataManageable {

    private readonly dishRepository: DishRepository;
    private readonly dishCommentRepository: DishCommentRepository;
    private readonly dishRatingRepository: DishRatingRepository;

    constructor(
        @Inject(REPOSITORIES_TOKEN)
        private readonly repositoryMap: RepositoryMap
    ) {
        this.dishRepository = this.repositoryMap[Repository.DISH_REPOSITORY];
        this.dishCommentRepository = this.repositoryMap[Repository.DISH_COMMENT_REPOSITORY];
        this.dishRatingRepository = this.repositoryMap[Repository.DISH_RATING_REPOSITORY];
    }

    async confirmDishEdition(id: DishId, dishSoftEdited?: DishEntity): Promise<void> {
        return await this.dishRepository.confirmDishEdition(id, dishSoftEdited);
    }

    async createNewDish(data: CreateDishVo, author?: string, ingredients?: DishIngredient[]): Promise<DishEntity> {
        return await this.dishRepository.createNewDish(data, author, ingredients);
    }

    async deleteAllComments(dishId: DishId): Promise<void> {
        return await this.dishCommentRepository.deleteAllComments(dishId);
    }

    async deleteAllRatings(dishId: DishId): Promise<void> {
        return await this.dishRatingRepository.deleteAllRatings(dishId);
    }

    async deleteDish(id: DishId): Promise<void> {
        return await this.dishRepository.deleteDish(id);
    }

    async findByDishId(id: DishId): Promise<DishEntity | null> {
        return await this.dishRepository.findByDishId(id);
    }

    async findDishesByAuthor(userLogin: string): Promise<DishOverviewVo[]> {
        return await this.dishRepository.findDishesByAuthor(userLogin);
    }

    async findDishesByIngredientsAndType(ingredients: string[], mealType?: MealType): Promise<DishResultVo[]> {
        return await this.dishRepository.findDishesByIngredientsAndType(ingredients, mealType);
    }

    async findOneAvailableDish(id: DishId): Promise<DishEntity | null> {
        return await this.dishRepository.findOneAvailableDish(id);
    }

    async findRating(userLogin: string, dishId: DishId): Promise<DishRatingEntity | null> {
        return await this.dishRatingRepository.findRating(userLogin, dishId);
    }

    async getAllComments(dishId: DishId, limit?: number): Promise<DishCommentEntity[]> {
        return await this.dishCommentRepository.getAllComments(dishId, limit);
    }

    async getAverageRatingForDish(dishId: DishId): Promise<DishRatingEntity> {
        return await this.dishRatingRepository.getAverageRatingForDish(dishId);
    }

    async getDishesWithSoftAdded(): Promise<DishEntity[]> {
        return await this.dishRepository.getDishesWithSoftAdded();
    }

    async getDishesWithSoftDeleted(): Promise<DishEntity[]> {
        return await this.dishRepository.getDishesWithSoftDeleted();
    }

    async getDishesWithSoftEdited(): Promise<DishEntity[]> {
        return await this.dishRepository.getDishesWithSoftEdited();
    }

    async insertEditionForDish(id: DishId, editDishVo: EditDishVo): Promise<void> {
        return await this.dishRepository.insertEditionForDish(id, editDishVo);
    }

    async insertNewRating(userLogin: string, dishId: DishId, rating: number): Promise<void> {
        return await this.dishRatingRepository.insertNewRating(userLogin, dishId, rating);
    }

    async postNewComment(userLogin: string, text: string, dishId: DishId): Promise<void> {
        return await this.dishCommentRepository.postNewComment(userLogin, text, dishId);
    }

    async setSoftDeletedForDish(id: DishId): Promise<void> {
        return await this.dishRepository.setSoftDeletedForDish(id);
    }

    async unsetSoftAddedForDish(id: DishId): Promise<void> {
        return await this.dishRepository.unsetSoftAddedForDish(id);
    }

    async updateRating(userLogin: string, dishId: DishId, newRating: number): Promise<void> {
        return await this.dishRatingRepository.updateRating(userLogin, dishId, newRating);
    }

}