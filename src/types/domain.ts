export type Pillar = "COURSES" | "SERVICES" | "LICENSING" | "CONSULTANCY";

export type ContentStatusValue =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED";

export type AvailabilityStatusValue =
  | "ACTIVE"
  | "UPCOMING"
  | "INTEREST_ONLY"
  | "INACTIVE";

export type LeadStatusValue =
  | "NEW"
  | "REVIEWED"
  | "CONTACTED"
  | "QUALIFIED"
  | "CONVERTED"
  | "CLOSED"
  | "SPAM";

export type AdminRoleValue = "ADMIN" | "EDITOR" | "LEAD_MANAGER";

export type PreferredContactValue = "PHONE" | "WHATSAPP" | "EMAIL" | "ANY";

export interface PublicCategoryDTO {
  id: string;
  pillar: Pillar;
  slug: string;
  nameBn: string;
  nameEn: string;
  shortDescBn: string;
  shortDescEn: string | null;
  iconName: string | null;
  sortOrder: number;
  publishedCount?: number;
}

export interface CourseModuleDTO {
  titleBn: string;
  topicsBn: string[];
}

export interface VerifiedInstructorDTO {
  id: string;
  nameBn: string;
  nameEn: string | null;
  titleBn: string | null;
  bioBn: string | null;
  credentialsSummaryBn: string | null;
}

export interface PublicCourseCard {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  summaryBn: string;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  availabilityStatus: AvailabilityStatusValue;
  featured: boolean;
  lastVerifiedAt: string | null;
  deliveryMode?: string | null;
  duration?: string | null;
  feeDisplay?: string | null;
}

export interface PublicCourseDetail extends PublicCourseCard {
  summaryEn: string | null;
  audienceBn: string;
  outcomes: string[];
  syllabus: CourseModuleDTO[];
  deliveryMode: string | null;
  duration: string | null;
  feeDisplay: string | null;
  instructor: VerifiedInstructorDTO | null;
  verifiedBy: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProcessStepDTO {
  stepNumber: number;
  titleBn: string;
  descriptionBn: string;
}

export interface PublicServiceCard {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  summaryBn: string;
  categorySlug: string;
  categoryNameBn: string;
  categoryNameEn: string;
  authorityName: string | null;
  availabilityStatus: AvailabilityStatusValue;
  requiresSpecialist: boolean;
  featured: boolean;
  lastVerifiedAt: string | null;
}

export interface PublicServiceDetail extends PublicServiceCard {
  summaryEn: string | null;
  whoNeedsItBn: string;
  assistanceScopeBn: string;
  limitationsBn: string;
  documentsSummary: string[];
  processSteps: ProcessStepDTO[];
  officialSourceLabel: string | null;
  officialSourceUrl: string | null;
  serviceFeeNoteBn: string | null;
  govtFeeNoteBn: string | null;
  verifiedBy: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicLicensingCard {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string | null;
  summaryBn: string;
  categorySlug: string;
  categoryNameBn: string;
  authorityName: string;
  authorityType: string;
  availabilityStatus: AvailabilityStatusValue;
  featured: boolean;
  lastVerifiedAt: string | null;
}

export interface PublicLicensingDetail extends PublicLicensingCard {
  summaryEn: string | null;
  officialSourceLabel: string;
  officialSourceUrl: string | null;
  serviceScopeBn: string;
  limitationsBn: string;
  documentsSummary: string[];
  processSummaryBn: string;
  verifiedBy: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicFaqItem {
  id: string;
  questionBn: string;
  answerBn: string;
  pillar: Pillar | null;
  isRegulatory: boolean;
  lastVerifiedAt: string | null;
}

export interface PublicSiteConfig {
  brandName: string;
  brandDisplayName: string;
  brandNameBn: string;
  taglineBn: string;
  taglineEn: string;
  logoAssetPath: string;
  isIdentityProvisional: boolean;
  verifiedPhone: string | null;
  verifiedWhatsapp: string | null;
  verifiedEmail: string | null;
  verifiedAddressBn: string | null;
  verifiedAddressEn: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  defaultSeoTitleBn: string;
  defaultSeoDescBn: string;
  legalDisclaimerBn: string;
  legalDisclaimerEn: string;
  privacyPolicyVersion: string;
  stagingNoticeBn: string | null;
}

export interface LeadSubmissionInput {
  name: string;
  mobile: string;
  email?: string | null;
  whatsapp?: string | null;
  addressArea: string;
  categoryContext: string;
  pillar: Pillar;
  targetSlug?: string | null;
  targetTitle?: string | null;
  problemDescription: string;
  preferredContact?: PreferredContactValue | null;
  consentAccepted: true;
  idempotencyKey: string;
  sourcePage: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  websiteHoneypot?: string | null;
  turnstileToken?: string | null;
}

export interface LeadSubmissionReceipt {
  publicReference: string;
  submittedAt: string;
  messageBn: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    messageBn: string;
    messageEn: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
