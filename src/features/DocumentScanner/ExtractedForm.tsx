import React, { useState } from 'react';
import { useCustomer } from '../../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';

const FIELD_LABELS: Record<string, string> = {
  document_type: 'Document Type',
  full_name: 'Full Name',
  date_of_birth: 'Date of Birth',
  gender: 'Gender',
  address: 'Address',
  pincode: 'PIN Code',
  id_number: 'ID Number',
  father_name: "Father's Name",
  mobile: 'Mobile Number',
  email: 'Email Address',
  employer_name: 'Employer Name',
  monthly_salary: 'Monthly Salary (₹)',
};

function validateField(key: string, value: string): string | null {
  if (!value) return null;
  if (key === 'id_number' && value.length === 12 && /^\d{12}$/.test(value)) return null;
  if (key === 'id_number' && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return null;
  if (key === 'pincode' && !/^\d{6}$/.test(value)) return 'Must be 6 digits';
  if (key === 'mobile' && !/^[6-9]\d{9}$/.test(value)) return 'Invalid Indian mobile number';
  return null;
}

interface Props {
  data: Record<string, string | null>;
  onReset: () => void;
}

export default function ExtractedForm({ data, onReset }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? '']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const { dispatch } = useCustomer();
  const navigate = useNavigate();

  const docType = data.document_type ?? 'Document';

  const handleBlur = (key: string) => {
    const err = validateField(key, values[key]);
    setErrors(prev => ({ ...prev, [key]: err ?? '' }));
  };

  const handleSave = () => {
    dispatch({ type: 'SET_SCANNED_DATA', data: values as any });
    setSaved(true);
    setTimeout(() => navigate('/customer/journey'), 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--teal-light)', color: 'var(--teal)' }}
        >
          {docType} detected
        </span>
        {saved && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
            ✓ Saved!
          </span>
        )}
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(FIELD_LABELS).filter(([k]) => k !== 'document_type').map(([key, label]) => {
          const value = values[key] ?? '';
          const detected = data[key] != null;
          const err = errors[key];

          return (
            <div key={key}>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">{label}</label>
              <div className="relative">
                <input
                  type="text"
                  value={value}
                  onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                  onBlur={() => handleBlur(key)}
                  placeholder="Not detected — enter manually"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm pr-8 focus:outline-none transition-colors"
                  style={{
                    borderColor: err ? '#F59E0B' : detected ? '#16A34A' : '#E2E8F0',
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                  {detected ? '✅' : '⚠️'}
                </span>
              </div>
              {err && <p className="text-xs text-amber-600 mt-0.5">{err}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
          style={{ backgroundColor: 'var(--teal)' }}
        >
          {saved ? '✓ Saved! Redirecting...' : 'Confirm & Save'}
        </button>
        <button
          onClick={onReset}
          className="px-5 py-3 border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Scan Another
        </button>
      </div>
    </div>
  );
}
