import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import UrgentTicker from './components/UrgentTicker';
import BottomDock from './components/BottomDock';
import HeroSection from './components/HeroSection';
import RadarSection from './components/RadarSection';
import DonorsView from './components/DonorsView';
import BloodBanksView from './components/BloodBanksView';
import MyDonorProfileView from './components/MyDonorProfileView';
import CommunitySurveyView from './components/CommunitySurveyView';
import EmergencyBroadcastModal from './components/EmergencyBroadcastModal';
import FirstAidModal from './components/FirstAidModal';
import DocsApprovalModal from './components/DocsApprovalModal';
import SurveyFormModal from './components/SurveyFormModal';
import RegisterDonorModal from './components/RegisterDonorModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import RespondModal from './components/RespondModal';
import AuthModal from './components/AuthModal';
import AdminView from './components/AdminView';
import ReportModal from './components/ReportModal';
import axiosInstance from './api/axios';
import { COMPATIBILITY_MAP } from './data/mockData';
import { playSosAlert, playSonarPing } from './utils/sound';

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

const toDonorView = (donor, index = 0) => {
  const donationsCount = donor.totalDonations || 0;
  return {
    ...donor,
    id: donor._id,
    status: donor.availabilityStatus || (donor.isAvailable ? 'Available' : 'Resting'),
    distance: 'Distance unavailable',
    distanceNum: null,
    badges: donationsCount ? [`${donationsCount} donations`] : ['Registered volunteer'],
    donationsCount,
    livesSaved: 0,
    bio: donor.bio || '',
    verificationStatus: donor.verificationStatus || 'Pending',
    isVerified: donor.verificationStatus === 'Verified',
    shareContact: donor.shareContact === true,
    availabilityIsStale: donor.availabilityIsStale,
    donorId: `DX-${String(donor._id).slice(-8).toUpperCase()}`,
    radarAngle: (index * 137.5) % 360,
    radarDist: 1 + (index % 4),
  };
};

const toRequestView = (request) => ({
  ...request,
  id: request._id,
  urgency: request.urgency?.toUpperCase() || 'NORMAL',
  timeAgo: new Date(request.createdAt).toLocaleString(),
  compatibleGroups: COMPATIBILITY_MAP[request.bloodGroup] || [],
});

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [user, setUser] = useState(readStoredUser);
  const [authReady, setAuthReady] = useState(() => !readStoredUser());
  const [donors, setDonors] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [banks, setBanks] = useState([]);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeSosIndex, setActiveSosIndex] = useState(0);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isFirstAidOpen, setIsFirstAidOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('seeker');
  const [selectedSosForResponse, setSelectedSosForResponse] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [surveyRevision, setSurveyRevision] = useState(0);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let active = true;
    axiosInstance.get('/blood-banks')
      .then(({ data }) => { if (active) setBanks(data); })
      .catch(() => { if (active) showToast('Could not load verified blood-bank listings.'); });
    return () => { active = false; };
  }, []);

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
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => { active = false; };
  }, []);

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
      ]);
      if (!active) return;

      const [donorResult, openResult, myResult, notificationResult, profileResult] = results;
      if (donorResult.status === 'fulfilled') {
        setDonors(donorResult.value.data.map(toDonorView));
      } else if (donorResult.reason.response?.status === 401) {
        localStorage.removeItem('bloodDonorUser');
        setUser(null);
        setDonors([]);
        setBroadcasts([]);
        setRequests([]);
        setNotifications([]);
        setCurrentDonor(null);
        showToast('Your session expired. Please sign in again.');
      } else {
        showToast('Could not load donor profiles.');
      }
      if (openResult.status === 'fulfilled') setBroadcasts(openResult.value.data.map(toRequestView));
      else showToast('Could not load open requests.');
      if (myResult.status === 'fulfilled') setRequests(myResult.value.data);
      else showToast('Could not load your requests.');
      if (notificationResult.status === 'fulfilled') setNotifications(notificationResult.value.data);
      else showToast('Could not load notifications.');

      if (profileResult.status === 'fulfilled' && profileResult.value.data) {
        const profile = toDonorView(profileResult.value.data);
        setCurrentDonor(profile);
        setUser((current) => current && saveUser({
          ...current,
          name: profile.name,
          email: profile.email || current.email,
          role: 'donor',
        }));
      } else {
        setCurrentDonor(null);
        if (profileResult.status === 'rejected' && profileResult.reason.response?.status !== 404) {
          showToast('Could not load your donor profile.');
        }
      }
      setDataLoading(false);
    };
    loadData();
    return () => { active = false; };
  }, [authReady, user?.token, user?.role]);

  useEffect(() => {
    if (!user?.token) return undefined;
    let active = true;
    const refreshLiveData = async () => {
      const results = await Promise.allSettled([
        axiosInstance.get('/requests/open'),
        axiosInstance.get('/requests/my'),
        axiosInstance.get('/notifications'),
        axiosInstance.get('/blood-banks'),
      ]);
      if (!active) return;
      if (results[0].status === 'fulfilled') setBroadcasts(results[0].value.data.map(toRequestView));
      if (results[1].status === 'fulfilled') setRequests(results[1].value.data);
      if (results[2].status === 'fulfilled') setNotifications(results[2].value.data);
      if (results[3].status === 'fulfilled') setBanks(results[3].value.data);
    };
    const interval = setInterval(refreshLiveData, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.token]);

  useEffect(() => {
    if (broadcasts.length <= 1) return undefined;
    const interval = setInterval(() => {
      setActiveSosIndex((previous) => (previous + 1) % broadcasts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [broadcasts.length]);

  const activeSos = broadcasts[activeSosIndex] || broadcasts[0];
  const openAuth = (mode = 'login', role = 'seeker') => {
    setAuthMode(mode);
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const handleSetActiveTab = (tab) => {
    if (tab === 'donors' && !user) {
      openAuth('login', 'seeker');
      showToast('Sign in to browse donor profiles.');
      return;
    }
    if (tab === 'admin' && user?.role !== 'admin') {
      showToast('Administrator access is required.');
      return;
    }
    setActiveTab(tab);
  };

  const handleOpenRequestForm = () => {
    if (!user) {
      openAuth('login', 'seeker');
      showToast('Sign in before creating a request so you can track its status.');
      return;
    }
    setIsSosModalOpen(true);
  };

  const handleOpenNotifications = () => {
    if (!user) {
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

  const handleAuthenticated = (authenticatedUser, mode) => {
    setUser(saveUser(authenticatedUser));
    setAuthReady(true);
    setIsAuthModalOpen(false);
    setActiveTab(authenticatedUser.role === 'donor' ? 'profile' : 'donors');
    if (mode === 'signup' && authenticatedUser.role === 'donor') setIsRegisterModalOpen(true);
    showToast(`Welcome, ${authenticatedUser.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('bloodDonorUser');
    setUser(null);
    setDonors([]);
    setBroadcasts([]);
    setRequests([]);
    setNotifications([]);
    setCurrentDonor(null);
    setDataLoading(false);
    setActiveTab('home');
    showToast('You have signed out.');
  };

  const handleCall = (target) => {
    if (!target.phone) {
      showToast('Contact details have not been shared for this profile.');
      return;
    }
    playSonarPing(soundEnabled);
    window.location.href = `tel:${target.phone}`;
  };

  const handleWhatsApp = (target) => {
    if (!target.phone) {
      showToast('Contact details have not been shared for this profile.');
      return;
    }
    playSonarPing(soundEnabled);
    const cleanPhone = target.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = `Hello ${target.name}, are you available to donate ${target.bloodGroup} blood? - DonorX`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerBroadcast = async (broadcast) => {
    try {
      const urgency = broadcast.urgency.startsWith('CRITICAL')
        ? 'Critical'
        : broadcast.urgency.startsWith('URGENT') ? 'Urgent' : 'Normal';
      const { data } = await axiosInstance.post('/requests', {
        requesterName: user.name,
        requesterPhone: broadcast.phone,
        requesterEmail: user.email,
        bloodGroup: broadcast.bloodGroup,
        unitsNeeded: broadcast.unitsNeeded,
        urgency,
        hospital: broadcast.hospital,
        area: broadcast.area,
        address: broadcast.address,
        shareContactWithDonor: broadcast.shareContactWithDonor,
        attendant: broadcast.attendant,
        patientName: broadcast.patientName,
        reason: broadcast.notes,
        notes: broadcast.notes,
      });
      setBroadcasts((current) => [toRequestView(data), ...current]);
      setRequests((current) => [data, ...current]);
      setActiveSosIndex(0);
      setIsSosModalOpen(false);
      playSosAlert(soundEnabled);
      showToast('Request saved. Compatible donors will receive in-app notifications.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save the emergency request.');
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
    setSelectedSosForResponse(request);
    setIsRespondModalOpen(true);
  };

  const handleConfirmResponse = async (responseData) => {
    try {
      await axiosInstance.post(`/requests/${responseData.sosId}/respond`, { eta: responseData.eta });
      setIsRespondModalOpen(false);
      const [openResult, notificationResult] = await Promise.all([
        axiosInstance.get('/requests/open'),
        axiosInstance.get('/notifications'),
      ]);
      setBroadcasts(openResult.data.map(toRequestView));
      setNotifications(notificationResult.data);
      setActiveSosIndex(0);
      playSonarPing(soundEnabled);
      showToast('Your response and ETA have been saved. The requester was notified.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save your response.');
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const { data } = await axiosInstance.put(`/requests/${requestId}`, { status });
      setRequests((current) => current.map((request) => request._id === requestId ? { ...request, ...data } : request));
      setBroadcasts((current) => current.filter((request) => request.id !== requestId));
      showToast(`Request marked ${status.toLowerCase()}.`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not update this request.');
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
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not update availability.');
    }
  };

  const handleUpdateEmailNotifications = async (emailNotifications) => {
    try {
      await axiosInstance.patch('/auth/notifications', { emailNotifications });
      setUser((current) => current && saveUser({ ...current, emailNotifications }));
      showToast(emailNotifications ? 'Email notifications enabled.' : 'Email notifications disabled.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save email preferences.');
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
    playSonarPing(soundEnabled);
    showToast(`Donor profile saved for ${savedDonor.name}.`);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const { data } = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((item) => item._id === notificationId ? data : item));
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not update notification.');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, readAt: new Date().toISOString() })));
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not update notifications.');
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
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save your survey response.');
      return false;
    }
  };

  const handleShareWhatsAppDrive = () => {
    const text = `Join Chhatrapati Sambhajinagar's voluntary blood donor network on DonorX.`;
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
    <div className={`app-wrapper ${isMobilePreview ? 'mobile-preview' : ''}`}>
      <Header
        onGoHome={() => handleSetActiveTab('home')}
        onOpenSosModal={handleOpenRequestForm}
        onOpenFirstAid={() => setIsFirstAidOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isMobilePreview={isMobilePreview}
        setIsMobilePreview={setIsMobilePreview}
        notificationsCount={notifications.filter((item) => !item.readAt).length}
        onOpenNotifications={handleOpenNotifications}
        onOpenAdmin={() => handleSetActiveTab('admin')}
        user={user}
        onOpenAuth={() => openAuth('login')}
        onLogout={handleLogout}
      />
      <UrgentTicker activeSos={activeSos} onRespond={handleOpenRespond} />
      <main className="content-container">
        {activeTab === 'home' && (
          <>
            <HeroSection
              onBroadcastClick={handleOpenRequestForm}
              onRegisterClick={handleRegisterClick}
              stats={{ donors: `${donors.length}`, activeReqs: `${broadcasts.length}`, avgResponse: '—', voluntary: '100% Free' }}
            />
            <RadarSection donors={donors} onCallDonor={handleCall} onWhatsAppDonor={handleWhatsApp} soundEnabled={soundEnabled} />
          </>
        )}
        {activeTab === 'donors' && (
          <section aria-busy={dataLoading}>
            {dataLoading && <div className="loading-message">Loading donor profiles…</div>}
            <DonorsView
              donors={donors}
              onCallDonor={handleCall}
              onWhatsAppDonor={handleWhatsApp}
              onReportDonor={(donor) => setReportTarget({ type: 'donor', id: donor.id })}
            />
          </section>
        )}
        {activeTab === 'banks' && <BloodBanksView banks={banks} onCallBank={handleCall} />}
        {activeTab === 'profile' && (
          <MyDonorProfileView
            currentDonor={currentDonor}
            user={user}
            requests={requests}
            onUpdateStatus={handleUpdateStatus}
            onOpenRegisterForm={handleRegisterClick}
            onUpdateRequest={handleUpdateRequest}
            onCallDonor={handleCall}
            onUpdateEmailNotifications={handleUpdateEmailNotifications}
          />
        )}
        {activeTab === 'admin' && user?.role === 'admin' && <AdminView />}
        {activeTab === 'community' && (
          <CommunitySurveyView
            onOpenSurveyModal={() => setIsSurveyModalOpen(true)}
            onShareWhatsApp={handleShareWhatsAppDrive}
            onCopyLink={handleCopyLink}
            refreshKey={surveyRevision}
          />
        )}
      </main>
      <BottomDock activeTab={activeTab} setActiveTab={handleSetActiveTab} onTriggerSos={handleOpenRequestForm} />
      <EmergencyBroadcastModal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)} onSubmitBroadcast={handleTriggerBroadcast} />
      <FirstAidModal isOpen={isFirstAidOpen} onClose={() => setIsFirstAidOpen(false)} />
      <DocsApprovalModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
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
        openRequests={broadcasts}
        onRespond={handleOpenRespond}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />
      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} onSubmitted={handleReportSubmitted} />
      <RespondModal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        sosRequest={selectedSosForResponse}
        currentDonor={currentDonor}
        onConfirmResponse={handleConfirmResponse}
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
