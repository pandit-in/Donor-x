// Rich Demo & Sandbox Data for DonorX (Chhatrapati Sambhajinagar)
import { INITIAL_DONORS, BLOOD_BANKS, INITIAL_EMERGENCY_BROADCASTS } from './mockData';

const sampleToday = new Date();
const sampleYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

export const DEMO_DONORS = INITIAL_DONORS.map((donor, idx) => ({
  ...donor,
  _id: donor.id || `demo-donor-${idx + 1}`,
  isDemo: true,
  isVerified: true,
  verificationStatus: 'Verified',
  status: donor.status || 'Available',
  isAvailable: donor.status === 'Available',
  availabilityStatus: donor.status || 'Available',
}));

export const DEMO_REQUESTS = INITIAL_EMERGENCY_BROADCASTS.map((req, idx) => ({
  ...req,
  _id: req.id || `demo-req-${idx + 1}`,
  status: idx === 0 ? 'Searching' : 'Donor Responded',
  urgency: req.urgency.replace(/\s*\(.*\)/, ''),
  createdAt: sampleToday.toISOString(),
  timeAgo: req.timeAgo || 'Recently',
  isDemo: true,
  donorResponses: idx === 1 ? [
    {
      _id: 'demo-resp-01',
      status: 'Accepted',
      eta: '15-20 mins',
      isConnected: false,
      donor: {
        _id: 'donor-1',
        name: 'Tejashree Rathod',
        phone: '8551926693',
        bloodGroup: 'O+',
        area: 'Kanchanwadi, Chh. Sambhajinagar',
      },
    },
  ] : [],
}));

export const DEMO_BANKS = BLOOD_BANKS.map((b) => ({
  ...b,
  _id: b.id,
  isDemo: true,
  inventoryIsCurrent: true,
}));

export const DEMO_USER = {
  _id: 'demo-user-1',
  name: 'Tejashree Rathod',
  email: 'tejashree@donorx.org',
  role: 'donor',
  emailNotifications: true,
  token: 'demo-token-12345',
};

export const DEMO_DONOR_PROFILE = {
  ...DEMO_DONORS[0],
  _id: 'demo-donor-me',
  id: 'demo-donor-me',
  name: 'Tejashree Rathod',
  email: 'tejashree@donorx.org',
  bloodGroup: 'O+',
  gender: 'Female',
  age: 21,
  weight: 60,
  area: 'Kanchanwadi, Chh. Sambhajinagar',
  phone: '8551926693',
  isAvailable: true,
  availabilityStatus: 'Available',
  status: 'Available',
  verificationStatus: 'Verified',
  isVerified: true,
  totalDonations: 4,
  donationsCount: 4,
  livesSaved: 12,
  donorId: 'DX-2026-8551',
  shareContact: true,
  lastDonation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
};

export const DEMO_RESPONSES = [
  {
    _id: 'demo-response-01',
    requestId: 'sos-2',
    bloodGroup: 'B+',
    unitsNeeded: 2,
    urgency: 'URGENT',
    hospital: 'MGM Medical College & Hospital',
    area: 'N-6, Cidco, Jalna Road',
    status: 'Donor Responded',
    responseStatus: 'Accepted',
    responseEta: '15-20 mins',
    requesterPhone: '9422789123',
    address: '2nd floor OT counter, MGM Hospital',
    createdAt: sampleYesterday.toISOString(),
    isDemo: true,
  },
];

export const DEMO_SURVEY_STATS = {
  total: 142,
  willingAnytime: 98,
  severeDelayPercent: 18,
  willingAnytimePercent: 69,
};
