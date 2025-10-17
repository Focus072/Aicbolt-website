import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    try {
      if (!formData || typeof formData.entries !== 'function') {
        return { error: 'Invalid form data' };
      }
      
      const formDataObject = Object.fromEntries(formData.entries());
      const result = schema.safeParse(formDataObject);
      
      if (!result.success) {
        return { error: result.error.errors[0].message };
      }

      return action(result.data, formData);
    } catch (error) {
      return { error: 'Failed to process form data' };
    }
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    try {
      const user = await getUser();
      if (!user) {
        throw new Error('User is not authenticated');
      }

      if (!formData || typeof formData.entries !== 'function') {
        return { error: 'Invalid form data' };
      }
      
      const formDataObject = Object.fromEntries(formData.entries());
      const result = schema.safeParse(formDataObject);
      
      if (!result.success) {
        return { error: result.error.errors[0].message };
      }

      return action(result.data, formData, user);
    } catch (error) {
      return { error: 'Failed to process form data' };
    }
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    const team = await getTeamForUser();
    if (!team) {
      throw new Error('Team not found');
    }

    return action(formData, team);
  };
}
