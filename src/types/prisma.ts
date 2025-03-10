import { Prisma } from '@prisma/client';

// Type for CloudNote where queries using path
export type CloudNoteWhereUnique = Prisma.CloudNoteWhereUniqueInput & {
  path?: string;
};

// Type for CloudFolder where queries using path
export type CloudFolderWhereUnique = Prisma.CloudFolderWhereUniqueInput & {
  path?: string;
}; 