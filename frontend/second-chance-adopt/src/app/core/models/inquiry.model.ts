export type InquiryStatus = 'New' | 'Contacted' | 'Closed';

export interface AdoptionInquiry {
  id: string;
  dogId: string;
  dogName: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  /** ISO timestamp. */
  createdAt: string;
  status: InquiryStatus;
}

/** What the adopter submits from the drawer. */
export type InquiryInput = Pick<AdoptionInquiry, 'dogId' | 'dogName' | 'fullName' | 'email' | 'phone' | 'message'>;

export const INQUIRY_STATUSES: InquiryStatus[] = ['New', 'Contacted', 'Closed'];
