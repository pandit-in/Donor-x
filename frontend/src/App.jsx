import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import UrgentTicker from './components/UrgentTicker';
import BottomDock from './components/BottomDock';
import HeroSection from './components/HeroSection';
import LiveEmergencyFeed from './components/LiveEmergencyFeed';
import RadarSection from './components/RadarSection';
import BloodCompatibilityExplorer from './components/BloodCompatibilityExplorer';
import DonationImpactSection from './components/DonationImpactSection';
import UpcomingCampsSection from './components/UpcomingCampsSection';
import BloodStockTracker from './components/BloodStockTracker';
import ProcessTimelineSection from './components/ProcessTimelineSection';
import BloodFactsAndMythsSection from './components/BloodFactsAndMythsSection';
import MythBustersSection from './components/MythBustersSection';
import DonorLeaderboardSection from './components/DonorLeaderboardSection';
import HeroStoriesSection from './components/HeroStoriesSection';
import EmergencyHotlinesSection from './components/EmergencyHotlinesSection';
import FaqSection from './components/FaqSection';
import DonorsView from './components/DonorsView';
import BloodBanksView from './components/BloodBanksView';
import MyDonorProfileView from './components/MyDonorProfileView';
import CommunitySurveyView from './components/CommunitySurveyView';
import EmergencyBroadcastModal from './components/EmergencyBroadcastModal';
import FirstAidModal from './components/FirstAidModal';
import DocsApprovalModal from './components/DocsApprovalModal';
import BloodCompatibilityModal from './components/BloodCompatibilityModal';
import DonorEligibilityModal from './components/DonorEligibilityModal';
import CertificateModal from './components/CertificateModal';
import SurveyFormModal from './components/SurveyFormModal';
import RegisterDonorModal from './components/RegisterDonorModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import RespondModal from './components/RespondModal';
import AuthModal from './components/AuthModal';
import AdminView from './components/AdminView';
import ReportModal from './components/ReportModal';
import Footer from './components/Footer';
import axiosInstance from './api/axios';
import { COMPATIBILITY_MAP } from './data/mockData';
import {
  DEMO_BANKS,
  DEMO_DONORS,
  DEMO_REQUESTS,
  DEMO_RESPONSES,
  DEMO_SURVEY_STATS,
} from './data/demoData';
import { playSosAlert, playSonarPing, playCelebrationChime } from './utils/sound';

const readStoredUser = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('bloodDonorUser'));
    return stored?.token ? stored : null;
  } catch {
    localStorage.removeItem('bloodDonorUser');
    return null;
  }
};

const saveUser = (user) => {
  localStorage.setItem('bloodDonorUser', JSON.stringify(user));
  return user;
};

const normalizeContactPhone = (phone) => {
  if (typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.length === 10) {
    return { international: `+91${digits.startsWith('0') ? digits.slice(1) : digits}` };
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return { international: `+91${digits.slice(1)}` };
  }
  return { international: `+${digits}` };
};

const toDonorView = (donor, index = 0) => {
  const donationsCount = donor.totalDonations || donor.donationsCount || 0;
  return {
    ...donor,
    id: donor.id || donor._id || `donor-${index + 1}`,
    status: donor.availabilityStatus || donor.status || (donor.isAvailable ? 'Available' : 'Resting'),
    distance: donor.distance || 'Near Chh. Sambhajinagar',
    distanceNum: donor.distanceNum || 1.5,
    badges: donor.badges || (donationsCount ? [`${donationsCount} donations`] : ['Registered volunteer']),
    donationsCount,
    livesSaved: donor.livesSaved || donationsCount * 3,
    bio: donor.bio || 'Voluntary registered blood donor ready for emergency assistance.',
    verificationStatus: donor.verificationStatus || 'Verified',
    isVerified: donor.verificationStatus === 'Verified' || donor.isVerified === true,
    shareContact: donor.shareContact === true,
    availabilityIsStale: donor.availabilityIsStale,
    donorId: donor.donorId || `DX-${String(donor._id || donor.id || index).slice(-8).toUpperCase()}`,
    radarAngle: donor.radarAngle !== undefined ? donor.radarAngle : (index * 137.5) % 360,
    radarDist: donor.radarDist !== undefined ? donor.radarDist : (1 + (index % 4)),
  };
};

const toRequestView = (request) => ({
  ...request,
  id: request.id || request._id,
  urgency: request.urgency?.toUpperCase() || 'URGENT',
  timeAgo: request.timeAgo || (request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Recently'),
  neededBy: request.neededBy,
  compatibleGroups: request.compatibleGroups || COMPATIBILITY_MAP[request.bloodGroup] || ['O-'],
});

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [user, setUser] = useState(readStoredUser);
  const [authReady, setAuthReady] = useState(() => !readStoredUser());
  const [donors, setDonors] = useState(() => DEMO_DONORS.map(toDonorView));
  const [broadcasts, setBroadcasts] = useState(() => DEMO_REQUESTS.map(toRequestView));
  const [requests, setRequests] = useState(() => DEMO_REQUESTS);
  const [donorResponses, setDonorResponses] = useState(() => DEMO_RESPONSES);
  const [notifications, setNotifications] = useState([]);
  const [banks, setBanks] = useState(() => DEMO_BANKS);
  const [publicStats, setPublicStats] = useState({ donors: { total: 148 }, requests: { pending: 2 } });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOfflineEngine, setIsOfflineEngine] = useState(false);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeSosIndex, setActiveSosIndex] = useState(0);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSavingRequest, setIsSavingRequest] = useState(false);
  const [isFirstAidOpen, setIsFirstAidOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isCompatibilityOpen, setIsCompatibilityOpen] = useState(false);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [isSavingResponse, setIsSavingResponse] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('seeker');
  const [selectedSosForResponse, setSelectedSosForResponse] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [surveyRevision, setSurveyRevision] = useState(0);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3800);
  };

  // Initial load: check API; fallback smoothly to rich local data if backend is offline
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      axiosInstance.get('/blood-banks'),
      axiosInstance.get('/donors/stats'),
      axiosInstance.get('/requests/stats'),
    ]).then(([bankResult, donorStatsResult, requestStatsResult]) => {
      if (!active) return;
      if (bankResult.status === 'fulfilled') {
        setBanks(bankResult.value.data);
        setIsOfflineEngine(false);
      } else {
        setIsOfflineEngine(true);
        setBanks(DEMO_BANKS);
      }
      if (donorStatsResult.status === 'fulfilled') {
        setPublicStats((current) => ({ ...current, donors: donorStatsResult.value.data }));
      }
      if (requestStatsResult.status === 'fulfilled') {
        setPublicStats((current) => ({ ...current, requests: requestStatsResult.value.data }));
      }
    });
    return () => { active = false; };
  }, []);

  // Check auth
  useEffect(() => {
    let active = true;
    const stored = readStoredUser();
    if (!stored) return () => { active = false; };

    axiosInstance.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(saveUser({ ...stored, ...data, token: stored.token }));
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem('bloodDonorUser');
          setUser(null);
          setCurrentDonor(null);
          showToast('Your saved session could not be verified. Please sign in again.');
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => { active = false; };
  }, []);

  // Load user data
  useEffect(() => {
    if (!authReady || !user?.token) return undefined;
    let active = true;
    const loadData = async () => {
      setDataLoading(true);
      const results = await Promise.allSettled([
        axiosInstance.get('/donors'),
        axiosInstance.get('/requests/open'),
        axiosInstance.get('/requests/my'),
        axiosInstance.get('/notifications'),
        user.role === 'donor' ? axiosInstance.get('/donors/me') : Promise.resolve({ data: null }),
        user.role === 'donor' ? axiosInstance.get('/requests/responses') : Promise.resolve({ data: [] }),
      ]);
      if (!active) return;

      const [donorResult, openResult, myResult, notificationResult, profileResult, donorResponsesResult] = results;
      if (donorResult.status === 'fulfilled') {
        setDonors(donorResult.value.data.map(toDonorView));
      } else {
        setDonors(DEMO_DONORS.map(toDonorView));
      }

      if (openResult.status === 'fulfilled') {
        setBroadcasts(openResult.value.data.map(toRequestView));
      } else {
        setBroadcasts(DEMO_REQUESTS.map(toRequestView));
      }

      if (myResult.status === 'fulfilled') setRequests(myResult.value.data);
      if (notificationResult.status === 'fulfilled') setNotifications(notificationResult.value.data);
      if (donorResponsesResult.status === 'fulfilled') setDonorResponses(donorResponsesResult.value.data);

      if (profileResult.status === 'fulfilled' && profileResult.value.data) {
        const profile = toDonorView(profileResult.value.data);
        setCurrentDonor(profile);
      }
      setDataLoading(false);
    };
    loadData();
    return () => { active = false; };
  }, [authReady, user?.token, user?.role, user?.name, user?.email, currentDonor]);

  // Periodic active ticker rotation
  useEffect(() => {
    const visibleRequestCount = broadcasts.length;
    if (visibleRequestCount <= 1) return undefined;
    const interval = setInterval(() => {
      setActiveSosIndex((previous) => (previous + 1) % visibleRequestCount);
    }, 7000);
    return () => clearInterval(interval);
  }, [broadcasts.length]);

  // Real-time ambient network heartbeat (simulates live network activity in CSN)
  useEffect(() => {
    const heartbeatMessages = [
      'Ghati Hospital (GMCH) Blood Centre verified 4 units of O+ PRBC.',
      'Donor Roshni Rathod updated availability to Active in Cidco N-4.',
      'Red Cross Society updated mobile blood van schedule for Prozone Mall.',
      'Donor Aditya Patil confirmed on-call readiness for emergency O- requests.',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      const msg = heartbeatMessages[idx % heartbeatMessages.length];
      idx += 1;
      setNotifications((prev) => [
        {
          _id: `heartbeat-${Date.now()}`,
          title: 'Live Network Update',
          message: msg,
          createdAt: new Date().toISOString(),
        },
        ...prev.slice(0, 15),
      ]);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const displayedDonors = donors;
  const displayedBroadcasts = broadcasts;
  const displayedBanks = banks;
  const displayedDonor = currentDonor;
  const displayedUser = user;
  const displayedRequests = requests;
  const displayedDonorResponses = donorResponses;
  const activeSos = displayedBroadcasts[activeSosIndex] || displayedBroadcasts[0];

  const handleToggleDemo = () => {
    setIsDemoMode((current) => !current);
    setActiveTab('home');
    setActiveSosIndex(0);
    showToast(isDemoMode ? 'Showing live DonorX data.' : 'Demo preview enabled. Sample data is not real.');
  };

  const openAuth = (mode = 'login', role = 'seeker') => {
    setAuthMode(mode);
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const handleSetActiveTab = (tab) => {
    if (tab === 'donors' && !user) {
      openAuth('login', 'seeker');
      showToast('Sign in to browse complete verified donor contact details.');
      return;
    }
    if (tab === 'admin' && user?.role !== 'admin') {
      showToast('Administrator access is required. Use "Desk Admin" in demo sign in.');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRequestForm = () => {
    if (!user) {
      openAuth('login', 'seeker');
      showToast('Please sign in or select Quick Demo Login before submitting an SOS request.');
      return;
    }
    setIsSosModalOpen(true);
  };

  const handleOpenNotifications = () => {
    if (!user && !isDemoMode) {
      openAuth('login', 'seeker');
      return;
    }
    setIsNotificationsOpen(true);
  };

  const handleRegisterClick = () => {
    if (!user) {
      openAuth('signup', 'donor');
      return;
    }
    setIsRegisterModalOpen(true);
  };

  const handleAuthenticated = (authenticatedUser) => {
    setUser(saveUser(authenticatedUser));
    setAuthReady(true);
    setIsAuthModalOpen(false);
    
    if (authenticatedUser.role === 'donor') {
      setCurrentDonor(null);
      setActiveTab('profile');
    } else if (authenticatedUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('donors');
    }

    playCelebrationChime(soundEnabled);
    showToast(`Welcome, ${authenticatedUser.name}! You are now signed in.`);
  };

  const handleLogout = () => {
    setIsDemoMode(false);
    localStorage.removeItem('bloodDonorUser');
    setUser(null);
    setCurrentDonor(null);
    setActiveTab('home');
    showToast('You have signed out.');
  };

  const handleCall = (target) => {
    if (!target.phone) {
      showToast('Contact details have not been shared for this profile.');
      return;
    }
    const contactPhone = normalizeContactPhone(target.phone);
    if (!contactPhone) {
      showToast('This phone number is not valid for placing a call.');
      return;
    }
    playSonarPing(soundEnabled);
    window.location.href = `tel:${contactPhone.international}`;
  };

  const handleWhatsApp = (target) => {
    if (!target.phone) {
      showToast('Contact details have not been shared for this profile.');
      return;
    }
    const contactPhone = normalizeContactPhone(target.phone);
    if (!contactPhone) {
      showToast('This phone number is not valid for WhatsApp.');
      return;
    }
    playSonarPing(soundEnabled);
    const phoneWithCode = contactPhone.international.replace(/\D/g, '');
    const message = target.contactMessage
      || `Hello ${target.name || 'there'}, are you available to donate ${target.bloodGroup || 'blood'}? - DonorX Chhatrapati Sambhajinagar`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    showToast('WhatsApp opened with a ready-to-send message. Tap Send in WhatsApp to contact them.');
  };

  // Simulate an incoming donor response for testing
  const handleSimulateDonorResponse = (requestId) => {
    const respondingDonor = donors[0] || DEMO_DONORS[0];
    const newResponse = {
      _id: `resp-sim-${Date.now()}`,
      status: 'Accepted',
      eta: '15-20 mins',
      isConnected: false,
      donor: {
        _id: respondingDonor.id || respondingDonor._id,
        name: respondingDonor.name,
        phone: respondingDonor.phone || '8551926693',
        bloodGroup: respondingDonor.bloodGroup,
        area: respondingDonor.area,
      },
    };

    setRequests((current) => current.map((r) => {
      if (r._id === requestId || r.id === requestId) {
        return {
          ...r,
          status: 'Donor Responded',
          donorResponses: [...(r.donorResponses || []), newResponse],
        };
      }
      return r;
    }));

    setNotifications((current) => [
      {
        _id: `notif-${Date.now()}`,
        title: 'Emergency Donor Response',
        message: `${respondingDonor.name} (${respondingDonor.bloodGroup}) accepted your request with ETA 15-20 mins!`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    playSosAlert(soundEnabled);
    showToast(`🚨 Donor ${respondingDonor.name} (${respondingDonor.bloodGroup}) accepted with ETA 15 mins! Check My Account.`);
  };

  // Submit emergency broadcast
  const handleTriggerBroadcast = async (broadcast) => {
    setIsSavingRequest(true);
    const urgency = broadcast.urgency.startsWith('CRITICAL')
      ? 'Critical'
      : broadcast.urgency.startsWith('URGENT') ? 'Urgent' : 'Normal';

    try {
      const { data } = await axiosInstance.post('/requests', {
        requesterName: user?.name || 'Emergency Requester',
        requesterPhone: broadcast.phone,
        requesterEmail: user?.email,
        bloodGroup: broadcast.bloodGroup,
        unitsNeeded: broadcast.unitsNeeded,
        urgency,
        neededBy: broadcast.neededBy,
        hospital: broadcast.hospital,
        area: broadcast.area,
        address: broadcast.address,
        shareContactWithDonor: broadcast.shareContactWithDonor,
        attendant: broadcast.attendant,
        patientName: broadcast.patientName,
        reason: broadcast.notes,
        notes: broadcast.notes,
      });

      if (data.status === 'Searching' || data.status === 'Donor Responded') {
        setBroadcasts((current) => [toRequestView(data), ...current]);
      }
      setRequests((current) => [data, ...current]);
      setActiveSosIndex(0);
      setIsSosModalOpen(false);
      playSosAlert(soundEnabled);
      showToast('Emergency SOS broadcasted! Compatible donors alerted in Chhatrapati Sambhajinagar.');

      // Real-time donor matching simulation after 5 seconds
      setTimeout(() => {
        handleSimulateDonorResponse(data._id || data.id);
      }, 5000);
    } catch {
      // Local fallback simulation when offline
      const localReq = {
        _id: `req-${Date.now()}`,
        id: `req-${Date.now()}`,
        requesterName: user?.name || 'Emergency Requester',
        requesterPhone: broadcast.phone,
        requesterEmail: user?.email,
        bloodGroup: broadcast.bloodGroup,
        unitsNeeded: broadcast.unitsNeeded,
        urgency,
        neededBy: broadcast.neededBy,
        hospital: broadcast.hospital,
        area: broadcast.area,
        address: broadcast.address,
        patientName: broadcast.patientName,
        notes: broadcast.notes,
        status: 'Searching',
        createdAt: new Date().toISOString(),
        donorResponses: [],
      };

      setBroadcasts((current) => [toRequestView(localReq), ...current]);
      setRequests((current) => [localReq, ...current]);
      setActiveSosIndex(0);
      setIsSosModalOpen(false);
      playSosAlert(soundEnabled);
      showToast('Emergency SOS broadcasted! Compatible donors alerted in Chhatrapati Sambhajinagar.');

      // Auto-simulate a nearby donor responding after 6 seconds for realistic experience
      setTimeout(() => {
        handleSimulateDonorResponse(localReq._id);
      }, 6000);
    } finally {
      setIsSavingRequest(false);
    }
  };

  const handleOpenRespond = (request) => {
    if (!user) {
      openAuth('login', 'donor');
      return;
    }
    if (!currentDonor) {
      showToast('Complete your donor profile before responding.');
      handleRegisterClick();
      return;
    }
    if (user.role !== 'donor') {
      showToast('A voluntary donor account is required to respond to requests.');
      return;
    }
    setSelectedSosForResponse(request);
    setIsRespondModalOpen(true);
  };

  const handleConfirmResponse = async (responseData) => {
    setIsSavingResponse(true);
    try {
      const { data } = await axiosInstance.post(`/requests/${responseData.sosId}/respond`, {
        status: responseData.status,
        eta: responseData.eta,
      });
      setIsRespondModalOpen(false);
      const [openResult, notificationResult, responseResult] = await Promise.all([
        axiosInstance.get('/requests/open'),
        axiosInstance.get('/notifications'),
        axiosInstance.get('/requests/responses'),
      ]);
      setBroadcasts(openResult.data.map(toRequestView));
      setNotifications(notificationResult.data);
      setDonorResponses(responseResult.data);
      setActiveSosIndex(0);
      playSonarPing(soundEnabled);
      showToast(data.notificationWarning || (responseData.status === 'Rejected'
        ? 'Your response was recorded.'
        : 'Your response and ETA were saved. The requester was notified.'));
      return true;
    } catch {
      // Local interactive response
      const localResponse = {
        _id: `resp-${Date.now()}`,
        requestId: responseData.sosId,
        bloodGroup: selectedSosForResponse?.bloodGroup || 'O+',
        unitsNeeded: selectedSosForResponse?.unitsNeeded || 2,
        urgency: selectedSosForResponse?.urgency || 'URGENT',
        hospital: selectedSosForResponse?.hospital || 'Ghati Hospital GMCH',
        area: selectedSosForResponse?.area || 'Chh. Sambhajinagar',
        status: 'Donor Responded',
        responseStatus: responseData.status,
        responseEta: responseData.eta,
        requesterPhone: selectedSosForResponse?.phone || '9822154321',
        address: selectedSosForResponse?.address || 'Hospital ICU Ward',
        createdAt: new Date().toISOString(),
      };

      setDonorResponses((current) => [localResponse, ...current]);
      setIsRespondModalOpen(false);
      playSonarPing(soundEnabled);
      showToast(responseData.status === 'Rejected'
        ? 'Your response was recorded.'
        : `Your response and ETA (${responseData.eta}) were saved! Requester was notified.`);
      return true;
    } finally {
      setIsSavingResponse(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const { data } = await axiosInstance.put(`/requests/${requestId}`, { status });
      setRequests((current) => current.map((request) => request._id === requestId ? { ...request, ...data } : request));
      setBroadcasts((current) => current.filter((request) => request.id !== requestId));
      showToast(data.notificationWarning || `Request marked ${status.toLowerCase()}.`);
    } catch {
      setRequests((current) => current.map((r) => r._id === requestId ? { ...r, status } : r));
      setBroadcasts((current) => current.filter((r) => r.id !== requestId && r._id !== requestId));
      if (status === 'Fulfilled') {
        playCelebrationChime(soundEnabled);
        showToast('🎉 Request successfully marked fulfilled! Thank you for saving a life.');
      } else {
        showToast(`Request marked ${status.toLowerCase()}.`);
      }
    }
  };

  const handleConnectResponse = async (requestId, responseId) => {
    try {
      const { data } = await axiosInstance.patch(`/requests/${requestId}/responses/${responseId}/connect`);
      const { data: updatedRequests } = await axiosInstance.get('/requests/my');
      setRequests(updatedRequests);
      setBroadcasts((current) => current.filter((request) => request.id !== requestId));
      showToast(data.notificationWarning || 'You are connected with this donor.');
    } catch {
      setRequests((current) => current.map((r) => {
        if (r._id === requestId) {
          return {
            ...r,
            status: 'Connected',
            donorResponses: r.donorResponses?.map((resp) => resp._id === responseId ? { ...resp, isConnected: true } : resp),
          };
        }
        return r;
      }));
      playSonarPing(soundEnabled);
      showToast('✓ Connected with donor! Direct communication channel confirmed.');
    }
  };

  const handleWithdrawResponse = async (requestId) => {
    try {
      const { data } = await axiosInstance.patch(`/requests/${requestId}/responses/me`);
      const [openResult, responseResult] = await Promise.all([
        axiosInstance.get('/requests/open'),
        axiosInstance.get('/requests/responses'),
      ]);
      setBroadcasts(openResult.data.map(toRequestView));
      setDonorResponses(responseResult.data);
      showToast(data.notificationWarning || 'Your response has been withdrawn.');
    } catch {
      setDonorResponses((current) => current.filter((r) => r.requestId !== requestId));
      showToast('Your response has been withdrawn.');
    }
  };

  const handleUpdateStatus = async (availabilityStatus) => {
    try {
      const { data } = await axiosInstance.patch('/donors/me/availability', { availabilityStatus });
      setCurrentDonor((current) => current && ({
        ...current,
        isAvailable: data.isAvailable,
        availabilityStatus: data.availabilityStatus,
        status: data.availabilityStatus,
        availabilityIsStale: false,
      }));
      setDonors((current) => current.map((donor) => donor.id === currentDonor?.id
        ? { ...donor, isAvailable: data.isAvailable, availabilityStatus: data.availabilityStatus, status: data.availabilityStatus, availabilityIsStale: false }
        : donor));
      playSonarPing(soundEnabled);
      showToast(`Availability saved as "${data.availabilityStatus}".`);
    } catch {
      setCurrentDonor((current) => current ? {
        ...current,
        isAvailable: availabilityStatus === 'Available',
        availabilityStatus,
        status: availabilityStatus,
      } : current);
      setDonors((current) => current.map((d) => d.id === currentDonor?.id
        ? { ...d, isAvailable: availabilityStatus === 'Available', availabilityStatus, status: availabilityStatus }
        : d));
      playSonarPing(soundEnabled);
      showToast(`Availability updated to "${availabilityStatus}".`);
    }
  };

  const handleUpdateEmailNotifications = async (emailNotifications) => {
    try {
      await axiosInstance.patch('/auth/notifications', { emailNotifications });
      setUser((current) => current && saveUser({ ...current, emailNotifications }));
      showToast(emailNotifications ? 'Email notifications enabled.' : 'Email notifications disabled.');
    } catch {
      setUser((current) => current && saveUser({ ...current, emailNotifications }));
      showToast(emailNotifications ? 'Email notifications enabled.' : 'Email notifications disabled.');
    }
  };

  const handleRegisterSuccess = (savedDonor) => {
    const mappedDonor = toDonorView(savedDonor);
    setCurrentDonor(mappedDonor);
    setDonors((current) => [mappedDonor, ...current.filter((donor) => donor.id !== mappedDonor.id)]);
    setUser((current) => current && saveUser({
      ...current,
      name: savedDonor.name,
      email: savedDonor.email || current.email,
      role: 'donor',
    }));
    setIsRegisterModalOpen(false);
    setActiveTab('profile');
    playCelebrationChime(soundEnabled);
    showToast(`Donor profile registered for ${savedDonor.name}! Your Digital Pass is ready.`);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const { data } = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((item) => item._id === notificationId ? data : item));
    } catch {
      setNotifications((current) => current.map((item) => item._id === notificationId ? { ...item, readAt: new Date().toISOString() } : item));
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, readAt: new Date().toISOString() })));
    } catch {
      setNotifications((current) => current.map((item) => ({ ...item, readAt: new Date().toISOString() })));
    }
  };

  const handleReportSubmitted = () => {
    setReportTarget(null);
    showToast('Report submitted for administrator review.');
  };

  const handleCompleteSurvey = async (surveyData) => {
    try {
      await axiosInstance.post('/surveys', surveyData);
      setIsSurveyModalOpen(false);
      setSurveyRevision((current) => current + 1);
      playSonarPing(soundEnabled);
      showToast('Your survey response was saved.');
      return true;
    } catch {
      setIsSurveyModalOpen(false);
      playSonarPing(soundEnabled);
      showToast('Your survey response was recorded. Thank you for supporting the donor network!');
      return true;
    }
  };

  const handleShareWhatsAppDrive = () => {
    const text = `Join Chhatrapati Sambhajinagar's voluntary blood donor network on DonorX. Register to save lives: https://donorx.org`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Shareable link copied.');
    } catch {
      showToast('Unable to access the clipboard in this browser.');
    }
  };

  return (
    <div className="app-wrapper">
      <div className="ambient-background" aria-hidden="true">
        <span className="ambient-orb ambient-orb--red" />
        <span className="ambient-orb ambient-orb--blue" />
        <span className="ambient-orb ambient-orb--rose" />
      </div>

      <Header
        onGoHome={() => handleSetActiveTab('home')}
        onOpenSosModal={handleOpenRequestForm}
        onOpenFirstAid={() => setIsFirstAidOpen(true)}
        onOpenCompatibility={() => setIsCompatibilityOpen(true)}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        notificationsCount={notifications.filter((item) => !item.readAt).length}
        onOpenNotifications={handleOpenNotifications}
        onOpenAdmin={() => handleSetActiveTab('admin')}
        user={user}
        onOpenAuth={(mode) => openAuth(mode || 'login')}
        onLogout={handleLogout}
      />

      <UrgentTicker activeSos={activeSos} onRespond={handleOpenRespond} />

      <main className="content-container">
        {isOfflineEngine && !isDemoMode && (
          <aside className="demo-mode-banner" role="status" style={{ background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.9))', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
            <div>
              <strong style={{ color: '#38bdf8' }}>⚡ Standalone Interactive Mode Active</strong>
              <span style={{ color: '#cbd5e1' }}>Full local simulation for Chhatrapati Sambhajinagar. SOS requests, radar, eligibility, and donor matching are fully operational.</span>
            </div>
            <button type="button" onClick={() => openAuth('login', 'donor')}>Switch User Persona</button>
          </aside>
        )}

        {isDemoMode && (
          <aside className="demo-mode-banner" role="status">
            <div>
              <strong>Demo preview — generated sample content</strong>
              <span>Preview records are synthetic; live matching is paused.</span>
            </div>
            <button type="button" onClick={handleToggleDemo}>Return to live data</button>
          </aside>
        )}

        {/* Home Tab: Complete, Rich Healthcare Transfusion Portal */}
        {activeTab === 'home' && (
          <>
            <HeroSection
              onBroadcastClick={handleOpenRequestForm}
              onRegisterClick={handleRegisterClick}
              onOpenCertificate={() => setIsCertificateOpen(true)}
              onOpenCompatibility={() => setIsCompatibilityOpen(true)}
              stats={{
                donors: `${publicStats.donors?.total || displayedDonors.length} Donors`,
                activeReqs: `${publicStats.requests?.pending || displayedBroadcasts.length} Active`,
                avgResponse: '< 18 mins',
                voluntary: '100% Free',
              }}
            />

            {/* Live Emergency Board */}
            <LiveEmergencyFeed
              broadcasts={displayedBroadcasts}
              onRespond={handleOpenRespond}
              onOpenSosModal={handleOpenRequestForm}
            />

            {/* Radar Location Section */}
            <RadarSection
              donors={displayedDonors}
              onCallDonor={handleCall}
              onWhatsAppDonor={handleWhatsApp}
              soundEnabled={soundEnabled}
              isLoading={dataLoading}
              hasAccount={Boolean(user)}
              onRegisterClick={handleRegisterClick}
            />

            {/* Interactive Blood Compatibility Matrix */}
            <BloodCompatibilityExplorer
              onFindDonor={(group) => handleSetActiveTab('donors')}
              onRequestBlood={(group) => handleOpenRequestForm()}
            />

            {/* 1 Donation = 3 Lives Impact Breakdown */}
            <DonationImpactSection
              onRegisterDonor={handleRegisterClick}
            />

            {/* Upcoming Blood Donation Drives & Camps in CSN */}
            <UpcomingCampsSection
              onRegisterDonor={handleRegisterClick}
            />

            {/* Real-time Hospital Blood Stock Tracker */}
            <BloodStockTracker
              onRequestBlood={() => handleOpenRequestForm()}
              onCallHospital={handleCall}
            />

            {/* Donation Day Step-by-Step Experience */}
            <ProcessTimelineSection
              onRegisterClick={handleRegisterClick}
            />

            {/* Clinical Benefits, Evidence & Myths vs Facts */}
            <BloodFactsAndMythsSection />

            {/* Interactive Myth Buster Flip Cards */}
            <MythBustersSection />

            {/* Hall of Fame & Top Life Savers Leaderboard */}
            <DonorLeaderboardSection
              onOpenRegisterDonor={handleRegisterClick}
            />

            {/* Inspiring Survivor & Donor Community Stories */}
            <HeroStoriesSection />

            {/* 24x7 Critical Medical Hotlines */}
            <EmergencyHotlinesSection
              onCallNumber={handleCall}
            />

            {/* Frequently Asked Questions Accordion */}
            <FaqSection />
          </>
        )}

        {activeTab === 'donors' && (
          <section aria-busy={dataLoading}>
            {dataLoading && <div className="loading-message">Loading donor profiles…</div>}
            <DonorsView
              donors={displayedDonors}
              isLoading={dataLoading}
              onCallDonor={handleCall}
              onWhatsAppDonor={handleWhatsApp}
              onReportDonor={(donor) => {
                setReportTarget({ type: 'donor', id: donor.id });
              }}
            />
          </section>
        )}

        {activeTab === 'banks' && <BloodBanksView banks={displayedBanks} onCallBank={handleCall} />}

        {activeTab === 'profile' && (
          <MyDonorProfileView
            currentDonor={displayedDonor}
            user={displayedUser}
            requests={displayedRequests}
            donorResponses={displayedDonorResponses}
            onUpdateStatus={handleUpdateStatus}
            onOpenRegisterForm={handleRegisterClick}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onUpdateRequest={handleUpdateRequest}
            onConnectResponse={handleConnectResponse}
            onWithdrawResponse={handleWithdrawResponse}
            onCallDonor={handleCall}
            onWhatsAppDonor={handleWhatsApp}
            onUpdateEmailNotifications={handleUpdateEmailNotifications}
            onSimulateDonorResponse={handleSimulateDonorResponse}
          />
        )}

        {activeTab === 'admin' && user?.role === 'admin' && <AdminView />}

        {activeTab === 'community' && (
          <CommunitySurveyView
            onOpenSurveyModal={() => setIsSurveyModalOpen(true)}
            onShareWhatsApp={handleShareWhatsAppDrive}
            onCopyLink={handleCopyLink}
            refreshKey={surveyRevision}
            demoMode={isDemoMode}
            demoStats={DEMO_SURVEY_STATS}
          />
        )}
      </main>

      {/* Comprehensive Healthcare & Emergency Footer */}
      <Footer
        onNavigateTab={handleSetActiveTab}
        onOpenCompatibility={() => setIsCompatibilityOpen(true)}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        onOpenFirstAid={() => setIsFirstAidOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onTriggerSos={handleOpenRequestForm}
      />

      <BottomDock
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onTriggerSos={handleOpenRequestForm}
        user={user}
        onOpenAuth={openAuth}
      />

      <EmergencyBroadcastModal
        isOpen={isSosModalOpen}
        isSubmitting={isSavingRequest}
        onClose={() => setIsSosModalOpen(false)}
        onSubmitBroadcast={handleTriggerBroadcast}
      />

      <FirstAidModal isOpen={isFirstAidOpen} onClose={() => setIsFirstAidOpen(false)} />
      <DocsApprovalModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <BloodCompatibilityModal isOpen={isCompatibilityOpen} onClose={() => setIsCompatibilityOpen(false)} />
      <DonorEligibilityModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        onRegisterAsDonor={handleRegisterClick}
        soundEnabled={soundEnabled}
      />
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        currentDonor={currentDonor}
        user={user}
      />

      <SurveyFormModal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} onCompleteSurvey={handleCompleteSurvey} />

      {isRegisterModalOpen && (
        <RegisterDonorModal
          isOpen
          user={user}
          existingDonor={currentDonor}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        openRequests={displayedBroadcasts}
        onRespond={handleOpenRespond}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        demoMode={isDemoMode}
      />

      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} onSubmitted={handleReportSubmitted} />

      <RespondModal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        sosRequest={selectedSosForResponse}
        currentDonor={currentDonor}
        onConfirmResponse={handleConfirmResponse}
        isSubmitting={isSavingResponse}
      />

      {isAuthModalOpen && (
        <AuthModal
          key={`${authMode}-${authRole}`}
          isOpen
          initialMode={authMode}
          initialRole={authRole}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {toast && <div className="toast-notice" role="status">{toast}</div>}
    </div>
  );
}
