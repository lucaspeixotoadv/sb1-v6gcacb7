import { v4 as uuidv4 } from 'uuid';

export const generateId = (prefix?: string): string => {
  const uuid = uuidv4();
  return prefix ? `${prefix}-${uuid}` : uuid;
};