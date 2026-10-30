import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { LeadInput, NextFollowUpInput } from '../../context/DataContext';
import { FollowUp, FollowUpType, LEAD_STATUSES, Lead, LeadStatus, Priority } from '../../types';
import { Button, Input, Select, Textarea, PhoneInput } from '../ui';
import { isEmail, isPhone, normalizePhone, required } from '../../utils/validation';
import { todayISO } from '../../utils/date';

interface LeadFormProps {
  initialLead?: Lead;
  initialFollowUp?: FollowUp;
  onSubmit: (lead: LeadInput, nextFollowUp?: NextFollowUpInput) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function LeadForm({
  initialLead,
  initialFollowUp,
  onSubmit,
  loading = false,
  submitLabel = 'Save Lead',
}: LeadFormProps) {
  const navigate = useNavigate();

  const [company, setCompany] = useState(initialLead?.company || '');
  const [contactName, setContactName] = useState(initialLead?.contactName || '');
  const [title, setTitle] = useState(initialLead?.title || '');
  const [email, setEmail] = useState(initialLead?.email || '');
  const [phone, setPhone] = useState(initialLead?.phone || '');
  const [corporatePhone, setCorporatePhone] = useState(initialLead?.corporatePhone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialLead?.whatsappNumber || '');
  const [completedOn, setCompletedOn] = useState(initialLead?.completedOn || todayISO());
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    if (initialLead?.countryCode) {
      return initialLead.countryCode as CountryCode;
    }
    if (initialLead?.phone?.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(initialLead.phone);
        if (parsed?.country) return parsed.country;
      } catch {}
    }
    return 'IN';
  });
  const [status, setStatus] = useState<LeadStatus>(initialLead?.status || 'New');
  const [meetingDate, setMeetingDate] = useState(initialLead?.meetingDate || '');
  const [meetingTime, setMeetingTime] = useState(initialLead?.meetingTime || '');
  const [lastContact, setLastContact] = useState(initialLead?.lastContact || '');
  const [comments, setComments] = useState(initialLead?.comments || '');
  const [source, setSource] = useState(initialLead?.source || 'Website');
  const [industry, setIndustry] = useState(initialLead?.industry || 'IT Services');
  const [dealValue, setDealValue] = useState(initialLead?.dealValue?.toString() || '100000');
  const [priority, setPriority] = useState<Priority>(initialLead?.priority || 'Medium');
  const [website, setWebsite] = useState(initialLead?.website || '');
  const [address, setAddress] = useState(initialLead?.address || 'India');

  // Next follow up scheduling
  const [scheduleFollowUp, setScheduleFollowUp] = useState(Boolean(initialFollowUp));
  const [fuDate, setFuDate] = useState(initialFollowUp?.date || '');
  const [fuTime, setFuTime] = useState(initialFollowUp?.time || '11:00');
  const [fuTitle, setFuTitle] = useState(initialFollowUp?.title || 'Call to discuss proposal');
  const [fuType, setFuType] = useState<FollowUpType>(initialFollowUp?.type || 'Call');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const reqCompany = required(company, 'Company name');
    if (reqCompany) errs.company = reqCompany;

    const reqContact = required(contactName, 'Person name');
    if (reqContact) errs.contactName = reqContact;

    if (email && !isEmail(email)) {
      errs.email = 'Valid email is required';
    }

    if (phone && phone.trim() && !isPhone(phone, selectedCountry)) {
      errs.phone = 'Please enter a valid phone number for the selected country.';
    }

    if (scheduleFollowUp && !fuDate) {
      errs.fuDate = 'Follow-up date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedPhone = normalizePhone(phone, selectedCountry);

    const leadInput: LeadInput = {
      company,
      contactName,
      title,
      email,
      phone: normalizedPhone || phone,
      corporatePhone,
      whatsappNumber,
      countryCode: selectedCountry,
      status: status || 'New',
      completedOn: completedOn || todayISO(),
      meetingDate,
      meetingTime,
      lastContact,
      comments,
      source,
      industry,
      dealValue: parseFloat(dealValue) || 0,
      priority,
      ownerId: initialLead?.ownerId || 'u_dinesh',
      address,
      website,
    };

    let nextFollowUp: NextFollowUpInput | undefined = undefined;
    if (scheduleFollowUp && fuDate) {
      nextFollowUp = { date: fuDate, time: fuTime, title: fuTitle, type: fuType };
    } else if (initialFollowUp && !scheduleFollowUp) {
      nextFollowUp = null;
    } else {
      nextFollowUp = undefined;
    }

    onSubmit(leadInput, nextFollowUp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6">
        <h3 className="text-sm font-bold text-navy dark:text-white border-b border-line pb-3">
          Lead Information
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company Name"
            placeholder="e.g. Acme Corporation"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            error={errors.company}
            required
          />
          <Input
            label="Person Name"
            placeholder="e.g. John Doe"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            error={errors.contactName}
            required
          />
          <Input
            label="Title / Designation"
            placeholder="e.g. Chief Technology Officer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <PhoneInput
            label="Phone Number"
            value={phone}
            onChange={(val, countryCode) => {
              setPhone(val);
              if (countryCode) setSelectedCountry(countryCode);
              if (errors.phone) {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.phone;
                  return copy;
                });
              }
            }}
            defaultCountry={selectedCountry}
            error={errors.phone}
          />
          <Input
            label="Corporate Phone"
            placeholder="e.g. +1 555-0199"
            value={corporatePhone}
            onChange={(e) => setCorporatePhone(e.target.value)}
          />
          <Input
            label="What's App Number"
            placeholder="e.g. +91 98765 43210"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
          <Input
            label="Website"
            placeholder="https://acme.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Input
            label="Location / Address"
            placeholder="e.g. Bangalore, India"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-bold text-navy dark:text-white border-b border-line pb-3">
          Deal Status
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Lead Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            options={LEAD_STATUSES}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={['Low', 'Medium', 'High']}
          />
          <Input
            label="Estimated Deal Value (₹)"
            type="number"
            value={dealValue}
            onChange={(e) => setDealValue(e.target.value)}
          />
          <Select
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            options={['IT Services', 'Software', 'Manufacturing', 'Retail', 'Healthcare', 'Education', 'Finance']}
          />
          <Select
            label="Lead Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Email Campaign']}
          />
          <Input
            label="Complete On Date"
            type="date"
            value={completedOn}
            onChange={(e) => setCompletedOn(e.target.value)}
          />
          <Input
            label="Last Connect Date"
            type="date"
            value={lastContact}
            onChange={(e) => setLastContact(e.target.value)}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Meeting Date"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
          <Input
            label="Meeting Time"
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Comments / Discussion Notes"
            placeholder="Add relevant notes from recent conversations or requirements..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy dark:text-white">Next Follow-up</h3>
            <p className="text-xs text-muted">Schedule an automatic follow-up reminder for this lead</p>
          </div>
          <input
            type="checkbox"
            id="followUpToggle"
            checked={scheduleFollowUp}
            onChange={(e) => setScheduleFollowUp(e.target.checked)}
            className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        {scheduleFollowUp && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Input
              label="Date"
              type="date"
              value={fuDate}
              onChange={(e) => {
                setFuDate(e.target.value);
                if (errors.fuDate) {
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.fuDate;
                    return copy;
                  });
                }
              }}
              error={errors.fuDate}
              required
            />
            <Input
              label="Time"
              type="time"
              value={fuTime}
              onChange={(e) => setFuTime(e.target.value)}
            />
            <Select
              label="Type"
              value={fuType}
              onChange={(e) => setFuType(e.target.value as FollowUpType)}
              options={['Call', 'Email', 'Meeting', 'Demo', 'WhatsApp']}
            />
            <Input
              label="Reminder Title"
              value={fuTitle}
              onChange={(e) => setFuTitle(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate(-1)} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
