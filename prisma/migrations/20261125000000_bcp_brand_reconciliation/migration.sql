-- Reconcile the active identity without deleting or replacing the SiteSetting row.
-- Verified contact and social fields are intentionally untouched.
ALTER TABLE "site_settings"
  ALTER COLUMN "brandName" SET DEFAULT 'Business Compliance Partner',
  ALTER COLUMN "brandDisplayName" SET DEFAULT 'BUSINESS COMPLIANCE PARTNER',
  ALTER COLUMN "brandNameBn" SET DEFAULT 'বিজনেস কমপ্লায়েন্স পার্টনার',
  ALTER COLUMN "taglineBn" SET DEFAULT 'এক অংশীদার। সম্পূর্ণ সমাধান। আত্মবিশ্বাসী প্রবৃদ্ধি।',
  ALTER COLUMN "taglineEn" SET DEFAULT 'One Partner. Complete Solutions. Confident Growth.',
  ALTER COLUMN "logoAssetPath" SET DEFAULT '',
  ALTER COLUMN "isIdentityProvisional" SET DEFAULT false,
  ALTER COLUMN "defaultSeoTitleBn" SET DEFAULT 'Business Compliance Partner | ব্যবসা, কমপ্লায়েন্স, প্রশিক্ষণ ও পরামর্শ',
  ALTER COLUMN "legalDisclaimerBn" SET DEFAULT 'Business Compliance Partner (BCP) একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।',
  ALTER COLUMN "legalDisclaimerEn" SET DEFAULT 'Business Compliance Partner (BCP) is an independent professional learning and business compliance assistance platform; it is not a government institution or official portal.',
  ALTER COLUMN "stagingNoticeBn" SET DEFAULT 'স্টেজিং সংস্করণ — যোগাযোগের তথ্য, মূল্য ও সক্রিয় অফার অনুমোদনসাপেক্ষ।';

UPDATE "site_settings"
SET
  "brandName" = 'Business Compliance Partner',
  "brandDisplayName" = 'BUSINESS COMPLIANCE PARTNER',
  "brandNameBn" = 'বিজনেস কমপ্লায়েন্স পার্টনার',
  "taglineBn" = 'এক অংশীদার। সম্পূর্ণ সমাধান। আত্মবিশ্বাসী প্রবৃদ্ধি।',
  "taglineEn" = 'One Partner. Complete Solutions. Confident Growth.',
  "logoAssetPath" = '',
  "isIdentityProvisional" = false,
  "defaultSeoTitleBn" = 'Business Compliance Partner | ব্যবসা, কমপ্লায়েন্স, প্রশিক্ষণ ও পরামর্শ',
  "legalDisclaimerBn" = 'Business Compliance Partner (BCP) একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।',
  "legalDisclaimerEn" = 'Business Compliance Partner (BCP) is an independent professional learning and business compliance assistance platform; it is not a government institution or official portal.',
  "stagingNoticeBn" = 'স্টেজিং সংস্করণ — যোগাযোগের তথ্য, মূল্য ও সক্রিয় অফার অনুমোদনসাপেক্ষ।',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'default'
  AND "brandName" = 'Paperwork Squad';
