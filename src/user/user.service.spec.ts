import { UserRepository } from '../contracts/user/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaUserRepository } from '../../src/repositories/prisma/user/prisma-user.repository';
import { Test } from '@nestjs/testing';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockedResult = {
  id: 2,
  name: 'John Doe',
  email: 'johndoe@mail.com',
  password: '12345678',
  created_at: new Date(),
  updated_at: null,
  deleted_at: null,
  is_active: true,
};

const mockedResultFindOne = {
  name: 'John Doe',
  email: 'johndoe@mail.com',
  created_at: new Date(),
  updated_at: null,
  deleted_at: null,
  is_active: true,
  bill: [],
  transaction: [],
};

const mockedResultUpdate = {
  id: 2,
  name: 'John Doe updated',
  email: 'johndoeupdate@mail.com',
  password: '12345678910',
  created_at: mockedResult.created_at,
  updated_at: new Date(),
  deleted_at: null,
  is_active: true,
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<PrismaUserRepository>;

  beforeEach(async () => {
    userRepository = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      findOneUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [UserController],
      providers: [
        UserService,
        PrismaUserRepository,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create an user', async () => {
      const dto = {
        name: 'John Doe',
        email: 'johndoe@mail.com',
        password: '12345678',
      };

      jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue({ id: 1 });

      const user = await userService.createUser(dto);

      expect(user).toEqual({ id: user.id });
    });

    it('should throw an error if the user already exists', async () => {
      const dto = {
        name: 'John Doe',
        email: 'johndoe@mail.com',
        password: '12345678',
      };

      jest
        .spyOn(userRepository, 'findUserByEmail')
        .mockResolvedValue(mockedResult);

      await expect(userService.createUser(dto)).rejects.toThrow(
        new BadRequestException('Already exists an user with this email'),
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should find an user by email', async () => {
      const email = 'johndoe@mail.com';

      jest
        .spyOn(userRepository, 'findUserByEmail')
        .mockResolvedValue(mockedResult);

      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(mockedResult);

      const findUser = await userService.findUserByEmail(email);

      console.log(findUser);

      expect(findUser.email).toEqual(email);
      expect(findUser).toEqual(mockedResult);
    });
  });

  describe('findOneUser', () => {
    it('should find an user by id', async () => {
      const id = 2;

      jest
        .spyOn(userRepository, 'findOneUser')
        .mockResolvedValue(mockedResultFindOne);
      jest
        .spyOn(userService, 'findOneUser')
        .mockResolvedValue(mockedResultFindOne);

      const findUser = await userService.findOneUser(id);

      expect(findUser).toEqual(mockedResultFindOne);
    });

    it('should not find an user by id', async () => {
      const id = 0;

      jest.spyOn(userRepository, 'findOneUser').mockResolvedValue(null);

      await expect(userService.findOneUser(id)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('updateUser', () => {
    it('should update an user', async () => {
      const dto = {
        id: 2,
        name: 'John Doe updated',
        email: 'johndoeupdate@mail.com',
        password: '12345678910',
      } as Partial<typeof mockedResultUpdate>;

      jest
        .spyOn(userRepository, 'findOneUser')
        .mockResolvedValue(mockedResultFindOne);

      jest
        .spyOn(userRepository, 'updateUser')
        .mockResolvedValue(mockedResultUpdate);

      const userDataUpdated = await userRepository.updateUser(dto, dto.id);
      const updateUser = await userService.updateUser(dto, dto.id);

      expect(updateUser.id).toEqual(dto.id);
      expect(userDataUpdated.name).toEqual(dto.name);
      expect(userDataUpdated.email).toEqual(dto.email);
      expect(userDataUpdated.password).toEqual(dto.password);
    });
  });

  describe('deleteUser', () => {
    it('should delete an user', async () => {
      const id = 2;

      jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(undefined);

      expect(await userRepository.deleteUser(id)).toBeUndefined();
    });
  });
});
