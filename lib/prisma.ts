/**
 * Re-export Prisma client from lib/db for backward compatibility.
 * Use: import prisma from '@/lib/prisma' or import { prisma } from '@/lib/prisma'
 */
export { prisma as default, prisma } from './db/prisma'
