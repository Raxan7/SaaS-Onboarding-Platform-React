/**
 * User related types
 */

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  company_name?: string;
};
