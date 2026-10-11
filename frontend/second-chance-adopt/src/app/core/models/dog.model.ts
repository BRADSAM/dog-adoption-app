export type DogStatus = 'Available' | 'Pending' | 'Adopted';
export type DogGender = 'Male' | 'Female';
export type DogSize = 'Small' | 'Medium' | 'Large';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  /** Age is stored in months so puppies and seniors share one field. */
  ageMonths: number;
  gender: DogGender;
  size: DogSize;
  status: DogStatus;
  imageUrl: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
  /** ISO date the dog arrived at the office. Drives "waiting" time. */
  arrivedOn: string;
}

/** What staff enter when adding or editing a dog. */
export type DogInput = Omit<Dog, 'id' | 'arrivedOn'>;

export const DOG_STATUSES: DogStatus[] = ['Available', 'Pending', 'Adopted'];
export const DOG_SIZES: DogSize[] = ['Small', 'Medium', 'Large'];
export const DOG_GENDERS: DogGender[] = ['Male', 'Female'];
