import { Search } from "lucide-react";

interface SearchBoxProps {
  action: string;
  defaultValue?: string;
  placeholderBn: string;
  labelBn: string;
  categoryHiddenValue?: string;
}

export function SearchBox({
  action,
  defaultValue = "",
  placeholderBn,
  labelBn,
  categoryHiddenValue,
}: SearchBoxProps) {
  return (
    <search>
      <form
        action={action}
        method="GET"
        className="flex flex-col sm:flex-row gap-2.5 items-stretch"
      >
        {categoryHiddenValue ? (
          <input type="hidden" name="category" value={categoryHiddenValue} />
        ) : null}
        <label htmlFor="catalogue-search-input" className="visually-hidden">
          {labelBn}
        </label>
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-[#51406F] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="catalogue-search-input"
            type="search"
            name="q"
            defaultValue={defaultValue}
            placeholder={placeholderBn}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="search"
            className="w-full min-h-12 ps-11 pe-4 py-2.5 rounded-[12px] border border-[#D4CCE3] bg-white text-[#181D26] text-base placeholder:text-[#596775]/75 focus:border-[#51406F]"
          />
        </div>
        <button type="submit" className="ps-primary-button shrink-0">
          খুঁজুন
        </button>
      </form>
    </search>
  );
}
