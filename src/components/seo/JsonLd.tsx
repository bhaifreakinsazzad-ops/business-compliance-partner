import { serializeJsonLd, type JsonLdRecord } from "@/lib/seo/structured-data";

interface JsonLdProps {
  data: JsonLdRecord;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
