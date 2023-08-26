import { Injectable } from '@nestjs/common';
import { UserLoginDto } from './user.dto';

const users = [
    {
        login: 'Test',
        password: '123'
    },
    {
        login: 'Test2',
        password: '456'
    }
];

@Injectable()
export class UserService {

    // public login(userLoginDto: UserLoginDto, headers) {
    //     const user = users.find(user => user.password === userLoginDto.password);
    //
    //     if (!user) {
    //         return '400 - credentials';
    //     }
    //
    //     if (!await bcrypt.compare(user.password, userLoginDto.password)) {
    //         return '400 - credentials 2';
    //     }
    //
    //     const jwt = await this.jwtService.signAsync(userLoginDto);
    //
    //     res.cookie('jwt', jwt, {httpOnly: true});
    //
    //     // const accessToken = jwt.sign(userLoginDto, process.env.ACCESS_TOKEN_SECRET);
    //     //
    //     // console.log(userLoginDto, headers);
    //     //
    //     // jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //     //     if (err) {
    //     //         return 403;
    //     //     }
    //     //
    //     //     return 'logged';
    //     // });
    // }

    public isAuthenticated(userLogin: UserLoginDto, headers) {
    }
}
