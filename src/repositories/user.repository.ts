import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma/client";


type CreateUserData=Pick<Prisma.UserCreateInput,"email"
|"username"
|"password">;

type UpdatedUserData=Prisma.UserUpdateInput;

export const userRepository={
  async create(data:CreateUserData){
    return prisma.user.create({
      data,
      select:{
        id:true,
        email:true,
        username:true,
       isVerified: true,
        acceptMessages: true,
        isPublic: true,
        createdAt: true,
      }
    })
  },

  async findById(id:string){
    return prisma.user.findUnique({
      where:{id},
        omit: {
        password: true,
      },
    })
  },

  async findByEmail(email:string){
    return prisma.user.findUnique({
      where:{email},
      select:{
        id:true,
        email:true,
        username:true,
       isVerified: true,
        acceptMessages: true,
        isPublic: true,
        createdAt: true,
      }
    })
  },

   async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
    async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        isPublic: true,
        isVerified: true,
        acceptMessages: true,
        createdAt: true,
      },
    });
  },

  async existsByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });
  },

  async existsByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
      },
    });
  },

  async update(id: string, data: UpdatedUserData) {
    return prisma.user.update({
      where: { id },
      data,
      omit: {
        password: true,
      },
    });
  },

  async markVerified(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
      },
      select: {
        id: true,
        isVerified: true,
      },
    });
  },

  async updatePassword(
    id: string,
    hashedPassword: string
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
  },

  async updateAcceptMessages(
    id: string,
    acceptMessages: boolean
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        acceptMessages,
      },
      select: {
        id: true,
        acceptMessages: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },


}