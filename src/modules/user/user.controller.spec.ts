import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '../../exceptions/bad-request.exception';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockUsers = [{
        login: 'Aaa',
        password: 'hashed password'
    }];

    const mockUserService = {
        loginUser: jest.fn().mockImplementation((userDto, res) => {
            const { login, password } = userDto;

            console.log(this);

            return { login, password };
            // const user = this.getUser(login);
            //
            // if (!user) {
            //     throw new BadRequestException('Class/Method', 'Bad request');
            // }
            //
            // if (!this.areSameHashedPasswords(user.password, password)) {
            //     throw new BadRequestException('Class/Method', 'Bad request');
            // }
            //
            // // TODO: something with res
            //
            // return user;
        }),
        // getUser: jest.fn().mockImplementation((login) => (mockUsers.find(user => user.login === login))),
        // areSameHashedPasswords: jest.fn().mockImplementation((trueOrFalse) => trueOrFalse)
        getUser: jest.fn(),
        areSameHashedPasswords: jest.fn()
    };

    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService
                }
            ]
        }).compile();

        controller = module.get(UserController);
        service = module.get(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // it('should log in user', async() => {
    //     const mockUserLoginDto = {
    //         login: 'Aaa',
    //         password: '123'
    //     };
    //     const mockUser = {
    //         login: 'Aaa',
    //         password: 'hashed password'
    //     };
    //     const mockResponse = {
    //         cookie: jest.fn()
    //     };
    //     // mockUserService.getUser = jest.fn().mockResolvedValueOnce(mockUser);
    //     // mockUserService.areSameHashedPasswords = jest.fn().mockResolvedValueOnce(true);
    //     mockUserService.getUser = jest.fn().mockResolvedValueOnce(mockUser);
    //     mockUserService.areSameHashedPasswords = jest.fn().mockResolvedValueOnce(true);
    //
    //     const result = await controller.login(mockUserLoginDto, mockResponse);
    //
    //     // await expect(controller.login(mockUserLoginDto, mockResponse)).rejects.toThrow(new BadRequestException('x/x', 'x'));
    //     expect(1).toBe(1);
    //     // expect(result).toBe(mockUser);
    // });

    // it('should log out user');

    // it('should create a new user');
});
