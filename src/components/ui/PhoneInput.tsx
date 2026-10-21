import {
  useState,
  useRef,
  useEffect,
  useId,
  forwardRef,
  useMemo,
  type ChangeEvent,
} from 'react';
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';
import flags from 'react-phone-number-input/flags';
import en from 'react-phone-number-input/locale/en.json';
import { AlertCircle, ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface PhoneInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (value: string, countryCode?: CountryCode) => void;
  defaultCountry?: CountryCode;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  wrapperClassName?: string;
}

interface CountryItem {
  code: CountryCode;
  name: string;
  callingCode: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    label,
    error,
    hint,
    required,
    value,
    onChange,
    defaultCountry = 'IN',
    placeholder,
    disabled = false,
    id,
    className,
    wrapperClassName,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  // Build sorted list of all supported countries
  const countriesList: CountryItem[] = useMemo(() => {
    const localeMap = en as Record<string, string>;
    const allCodes = getCountries();
    const list = allCodes.map((code) => {
      let callingCode = '';
      try {
        callingCode = getCountryCallingCode(code);
      } catch {
        callingCode = '';
      }
      return {
        code,
        name: localeMap[code] || code,
        callingCode: callingCode ? `+${callingCode}` : '',
      };
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Determine initial country based on value (if it has +country_code) or defaultCountry
  const detectCountryFromValue = (val: string): CountryCode => {
    if (val && val.trim().startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(val.trim());
        if (parsed?.country) {
          return parsed.country;
        }
      } catch {}
    }
    return defaultCountry;
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() =>
    detectCountryFromValue(value),
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Format the display string according to current country
  const formatValue = (raw: string, country: CountryCode): string => {
    if (!raw) return '';
    try {
      const formatter = new AsYouType(country);
      return formatter.input(raw);
    } catch {
      return raw;
    }
  };

  const [displayValue, setDisplayValue] = useState(() => formatValue(value, selectedCountry));

  // Sync state if external value changes
  useEffect(() => {
    if (value) {
      if (value.startsWith('+')) {
        try {
          const parsed = parsePhoneNumber(value);
          if (parsed?.country && parsed.country !== selectedCountry) {
            setSelectedCountry(parsed.country);
          }
        } catch {}
      }
      setDisplayValue(formatValue(value, selectedCountry));
    } else {
      setDisplayValue('');
    }
  }, [value, selectedCountry]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const callingCode = useMemo(() => {
    try {
      return `+${getCountryCallingCode(selectedCountry)}`;
    } catch {
      return '+91';
    }
  }, [selectedCountry]);

  // Filter countries by search query (country name or dialing code)
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countriesList;
    const q = searchQuery.trim().toLowerCase().replace(/^\+/, '');
    return countriesList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.callingCode.replace('+', '').includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [countriesList, searchQuery]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setDropdownOpen(false);

    // If there is already a number entered, format with new country
    if (displayValue) {
      const digitsOnly = displayValue.replace(/\D/g, '');
      const newFormatted = formatValue(digitsOnly, country);
      setDisplayValue(newFormatted);

      // Normalize to E.164 if valid or possible
      try {
        const parsed = parsePhoneNumber(digitsOnly, country);
        if (parsed?.number) {
          onChange(parsed.number, country);
        } else {
          onChange(newFormatted, country);
        }
      } catch {
        onChange(newFormatted, country);
      }
    } else {
      onChange('', country);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Reject letters
    if (/[a-zA-Z]/.test(inputVal)) {
      return;
    }

    // Auto-detect country switch if user enters a number starting with '+'
    let activeCountry = selectedCountry;
    if (inputVal.startsWith('+')) {
      const asYouType = new AsYouType();
      asYouType.input(inputVal);
      const detected = asYouType.getCountry();
      if (detected && detected !== selectedCountry) {
        activeCountry = detected;
        setSelectedCountry(detected);
      }
    }

    const formatted = formatValue(inputVal, activeCountry);
    setDisplayValue(formatted);

    // Normalize to E.164 if valid
    try {
      const parsed = parsePhoneNumber(inputVal, activeCountry);
      if (parsed && isValidPhoneNumber(inputVal, activeCountry)) {
        onChange(parsed.number, activeCountry);
      } else {
        // Pass the raw formatted string during typing so validation triggers correctly
        onChange(formatted, activeCountry);
      }
    } catch {
      onChange(formatted, activeCountry);
    }
  };

  const FlagComponent = (flags as Record<string, React.ComponentType<{ title?: string; className?: string }>>)[
    selectedCountry
  ];

  return (
    <div className={cn('relative', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="label-base">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      <div
        className={cn(
          'relative flex w-full items-center rounded-xl border border-line bg-surface transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/15',
          error && 'border-rose-400 focus-within:border-rose-400 focus-within:ring-rose-500/15',
          disabled && 'opacity-60 cursor-not-allowed',
          className,
        )}
      >
        {/* Country Selector Dropdown Trigger Button */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-1.5 border-r border-line py-2.5 pl-3 pr-2.5 text-sm font-medium text-ink hover:bg-soft/70 transition rounded-l-xl focus:outline-none"
            title={`${(en as Record<string, string>)[selectedCountry] || selectedCountry} (${callingCode})`}
          >
            <span className="flex h-4 w-6 shrink-0 items-center overflow-hidden rounded-sm shadow-xs">
              {FlagComponent ? (
                <FlagComponent title={selectedCountry} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs">🌐</span>
              )}
            </span>
            <span className="text-xs font-semibold text-muted">{callingCode}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted transition" />
          </button>

          {/* Searchable Country Selector Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-line bg-surface shadow-xl py-2 max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
              {/* Country Search Input */}
              <div className="px-3 pb-2 pt-1 border-b border-line">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full rounded-lg border border-line bg-soft/50 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Country List Options */}
              <ul
                role="listbox"
                className="overflow-y-auto flex-1 divide-y divide-line/30 py-1"
                style={{ scrollbarWidth: 'thin' }}
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => {
                    const CountryFlag = (
                      flags as Record<string, React.ComponentType<{ title?: string; className?: string }>>
                    )[c.code];
                    const isSelected = c.code === selectedCountry;

                    return (
                      <li
                        key={c.code}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCountrySelect(c.code)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-soft transition',
                          isSelected && 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 font-semibold',
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="flex h-3.5 w-5 shrink-0 items-center overflow-hidden rounded-xs shadow-2xs">
                            {CountryFlag ? (
                              <CountryFlag title={c.name} className="h-full w-full object-cover" />
                            ) : (
                              <span>🌐</span>
                            )}
                          </span>
                          <span className="truncate text-ink dark:text-ink">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-muted font-mono text-[11px]">{c.callingCode}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-brand-500" />}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-3 py-4 text-center text-xs text-muted">
                    No country matches "{searchQuery}"
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Formatted Phone Number Input */}
        <input
          ref={ref}
          id={inputId}
          type="tel"
          disabled={disabled}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder || `e.g. ${callingCode} 98765 43210`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="w-full bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
        />
      </div>

      {/* Validation Error Message */}
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
});
